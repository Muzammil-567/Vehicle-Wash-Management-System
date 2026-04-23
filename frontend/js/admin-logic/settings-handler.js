/**
 * System Settings Handler - Internal Tabs, Theme Logic, and Configuration
 */

function initSettingsLogic() {
    console.log('Initializing System Settings Logic...');
    const settingsContainer = document.getElementById('system-settings');
    if (!settingsContainer) return;

    initInternalTabSwitching();
    initLogoUploader();
    initThemeToggle();
    initSettingsForms();
    initBackupTool();
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
            
            // Toggle Buttons
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle Panels
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === targetId) p.classList.add('active');
            });
        };
    });
}

/**
 * Logic for Circular Neon Image Uploader
 */
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

/**
 * Handle Theme Toggling (Neon vs Standard Dark)
 */
function initThemeToggle() {
    const themeSwitch = document.getElementById('theme-toggle');
    if (themeSwitch) {
        themeSwitch.onchange = () => {
            if (themeSwitch.checked) {
                document.body.classList.remove('standard-dark-mode');
                if (typeof showSuccessToast === 'function') {
                    showSuccessToast('High Contrast Neon Mode Activated.');
                }
            } else {
                document.body.classList.add('standard-dark-mode');
                if (typeof showSuccessToast === 'function') {
                    showSuccessToast('Standard Dark Mode Activated.');
                }
            }
        };
    }
}

/**
 * Form Submission Feedback
 */
function initSettingsForms() {
    document.querySelectorAll('.settings-form-grid').forEach(form => {
        form.onsubmit = (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.style.opacity = '0.7';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.opacity = '1';
                if (typeof showSuccessToast === 'function') {
                    showSuccessToast('System settings updated successfully.');
                }
            }, 1000);
        };
    });
}

/**
 * Backup Tool Animation
 */
function initBackupTool() {
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.onclick = () => {
            const originalHTML = backupBtn.innerHTML;
            backupBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Exporting SQL...';
            backupBtn.disabled = true;

            setTimeout(() => {
                backupBtn.innerHTML = '<i class="fas fa-check-circle"></i> Download Ready';
                if (typeof showSuccessToast === 'function') {
                    showSuccessToast('Database SQL Dump generated and ready for download.');
                }
                setTimeout(() => {
                    backupBtn.innerHTML = originalHTML;
                    backupBtn.disabled = false;
                }, 3000);
            }, 2500);
        };
    }
}

// Global Export
window.initSettingsLogic = initSettingsLogic;
