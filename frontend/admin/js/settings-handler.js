/**
 * System Settings Handler - Internal Tabs, Profile Sync, and Business Rules
 */

async function initSettingsLogic() {
    console.log('Initializing System Settings Logic...');
    const settingsContainer = document.getElementById('system-settings');
    if (!settingsContainer) return;

    // Core Logic
    initInternalTabSwitching();
    initLogoUploader();
    initThemeToggle();
    
    // Data Sync
    await fetchAdminProfile();
    await fetchSystemSettings();

    // Form Submissions
    initFormHandlers();
    initFloatingLabels();
}

/**
 * Handle Floating Label Logic for filled inputs
 */
function initFloatingLabels() {
    const inputs = document.querySelectorAll('.settings-input');
    
    const updateLabel = (input) => {
        const group = input.closest('.form-group');
        if (group) {
            if (input.value && input.value.trim() !== "") {
                group.classList.add('has-content');
            } else {
                group.classList.remove('has-content');
            }
        }
    };

    inputs.forEach(input => {
        // Initial check
        updateLabel(input);
        // On change
        input.addEventListener('input', () => updateLabel(input));
        input.addEventListener('blur', () => updateLabel(input));
    });

    // Handle initial load for async data
    setTimeout(() => {
        inputs.forEach(updateLabel);
    }, 1000);
}

/**
 * Fetch Current Admin Profile
 */
async function fetchAdminProfile() {
    try {
        const response = await fetch(`${window.API_URL}/admin/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await response.json();
        if (json.success) {
            const admin = json.data;
            document.getElementById('admin-full-name').value = admin.full_name;
            document.getElementById('admin-email').value = admin.email;
            document.getElementById('admin-phone').value = admin.phone || '';
            
            if (admin.profile_image) {
                const preview = document.getElementById('logo-preview-img');
                const icon = document.getElementById('logo-placeholder-icon');
                preview.src = admin.profile_image;
                preview.style.display = 'block';
                icon.style.display = 'none';
            }
        }
    } catch (err) {
        console.error("🔥 Profile Sync Failed:", err);
    }
}

/**
 * Fetch System-wide Settings
 */
async function fetchSystemSettings() {
    try {
        const response = await fetch(`${window.API_URL}/admin/settings`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await response.json();
        if (json.success) {
            const s = json.data;
            document.getElementById('business-name').value = s.business_name || '';
            document.getElementById('business-address').value = s.business_address || '';
            document.getElementById('setting-currency').value = s.currency || 'RS';
            document.getElementById('setting-lead-time').value = s.lead_time || '2';
            document.getElementById('setting-hours-weekday').value = s.working_hours_weekday || '';
            document.getElementById('setting-hours-weekend').value = s.working_hours_weekend || '';
            document.getElementById('setting-email-alerts').checked = s.enable_email_alerts === '1';
            document.getElementById('setting-sms-alerts').checked = s.enable_sms_gateway === '1';
        }
    } catch (err) {
        console.error("🔥 Settings Sync Failed:", err);
    }
}

function initFormHandlers() {
    // 1. Profile & General Info
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                full_name: document.getElementById('admin-full-name').value,
                email: document.getElementById('admin-email').value,
                phone: document.getElementById('admin-phone').value,
                profile_image: document.getElementById('logo-preview-img').src,
                business_name: document.getElementById('business-name').value,
                business_address: document.getElementById('business-address').value
            };

            // Save Profile
            await sendSettingsUpdate('/admin/profile', data, 'Profile updated.');
            // Save Business Info (shares some fields)
            await sendSettingsUpdate('/admin/settings', {
                business_name: data.business_name,
                business_address: data.business_address
            });
        };
    }

    // 2. Business Rules
    const rulesForm = document.getElementById('rules-form');
    if (rulesForm) {
        rulesForm.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                currency: document.getElementById('setting-currency').value,
                lead_time: document.getElementById('setting-lead-time').value,
                working_hours_weekday: document.getElementById('setting-hours-weekday').value,
                working_hours_weekend: document.getElementById('setting-hours-weekend').value,
                enable_email_alerts: document.getElementById('setting-email-alerts').checked ? '1' : '0',
                enable_sms_gateway: document.getElementById('setting-sms-alerts').checked ? '1' : '0'
            };
            await sendSettingsUpdate('/admin/settings', data, 'Business rules applied.');
        };
    }

    // 3. Security (Password)
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
        securityForm.onsubmit = async (e) => {
            e.preventDefault();
            const cur = document.getElementById('current-password').value;
            const n1 = document.getElementById('new-password').value;
            const n2 = document.getElementById('confirm-password').value;

            if (n1 !== n2) return alert("New passwords do not match.");

            await sendSettingsUpdate('/admin/profile', {
                current_password: cur,
                new_password: n1
            }, 'Credentials updated successfully.');
        };
    }

    // 4. Maintenance (Factory Reset)
    const resetBtn = document.getElementById('factory-reset-btn');
    if (resetBtn) {
        resetBtn.onclick = async () => {
            if (confirm("🚨 CRITICAL WARNING: This will delete ALL customer records, bookings, and feedback. Only admin users will remain. Proceed?")) {
                const response = await fetch(`${window.API_URL}/admin/factory-reset`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    alert("System has been purged. Logged in admins are safe.");
                    window.location.reload();
                }
            }
        };
    }
}

async function sendSettingsUpdate(endpoint, data, successMsg) {
    try {
        const response = await fetch(`${window.API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            if (successMsg && typeof window.showSuccessToast === 'function') {
                window.showSuccessToast(successMsg);
            }
        } else {
            const err = await response.json();
            alert("Error: " + (err.message || "Update failed"));
        }
    } catch (err) {
        console.error("Update Error:", err);
    }
}

/**
 * Handles Vertical Sub-navigation within Settings
 */
function initInternalTabSwitching() {
    const navBtns = document.querySelectorAll('.subnav-btn');
    const panels = document.querySelectorAll('.settings-panel');

    navBtns.forEach(btn => {
        btn.onclick = () => {
            const targetId = `panel-${btn.dataset.settingsTab}`;
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === targetId) p.classList.add('active');
            });
        };
    });
}

function initLogoUploader() {
    const trigger = document.getElementById('logo-trigger');
    const input = document.getElementById('logo-input');
    const preview = document.getElementById('logo-preview-img');
    const icon = document.getElementById('logo-placeholder-icon');

    if (trigger && input) {
        trigger.onclick = () => input.click();
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                    icon.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        };
    }
}

function initThemeToggle() {
    const themeSwitch = document.getElementById('theme-toggle');
    if (themeSwitch) {
        themeSwitch.onchange = () => {
            document.body.classList.toggle('standard-dark-mode', !themeSwitch.checked);
            const msg = themeSwitch.checked ? 'High Contrast Neon Activated' : 'Standard Dark Mode Activated';
            if (typeof window.showSuccessToast === 'function') window.showSuccessToast(msg);
        };
    }
}

window.initSettingsLogic = initSettingsLogic;
