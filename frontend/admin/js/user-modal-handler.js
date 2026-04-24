/**
 * User Modal & Editor Logic - Handles adding and editing users via modals
 */

// Use Global Event Delegation for the "Add New User" button
document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-add-user');
    if (addBtn) {
        console.log("🚀 [UserModal] Add New User clicked");
        const modal = document.getElementById('add-user-modal-overlay');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Ensure form is fresh
            const form = document.getElementById('add-user-form');
            if (form) {
                form.reset();
                initUserModal(); // Re-bind onsubmit to be sure
            }
        } else {
            console.error("❌ [UserModal] Modal overlay not found");
        }
    }
});

function initUserModal() {
    const modal = document.getElementById('add-user-modal-overlay');
    const closeBtns = [document.getElementById('close-user-modal'), document.getElementById('cancel-user-modal')];
    const form = document.getElementById('add-user-form');

    if (!modal || !form) {
        console.warn("⚠️ [UserModal] Modal or Form missing from DOM");
        return;
    }

    // Modal Closing logic
    closeBtns.forEach(btn => {
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                modal.style.display = 'none';
                document.body.style.overflow = '';
                form.reset();
            };
        }
    });

    // Add User Submit Handler
    form.onsubmit = async (e) => {
        e.preventDefault();
        console.log("💾 [UserModal] Submitting new user data...");

        const token = localStorage.getItem('token');
        const userData = {
            full_name: document.getElementById('user-full-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            password: document.getElementById('user-password').value,
            role: document.getElementById('user-role').value
        };

        try {
            const response = await fetch(`${window.API_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (data.success) {
                window.showSuccessToast(data.message || "User created successfully!");
                modal.style.display = 'none';
                document.body.style.overflow = '';
                form.reset();
                // Refresh relevant tables
                if (typeof loadUsers === 'function') loadUsers(window.currentRole || 'customer'); 
                if (typeof fetchStaffList === 'function') fetchStaffList();
            } else {
                alert(data.message || 'Failed to create user.');
            }
        } catch (err) {
            console.error("❌ [UserModal] POST Error:", err);
            alert('Server connection error while creating user.');
        }
    };
}

/**
 * Handles User Editing - Populates Shared Admin Modal
 */
window.handleUserEdit = function (btn) {
    console.log("✏️ [UserModal] Editing user...");
    const row = btn.closest('tr');
    if (!row) return;

    const idText = row.cells[0].textContent; 
    window.currentEditingUserId = idText.split('-').pop(); 
    
    const name = row.cells[1].textContent;
    const email = row.cells[2].textContent;
    const phone = row.cells[3].textContent;

    // Sync Modal UI Labels
    const modalTitle = document.getElementById('modal-title');
    const nameLabel = document.querySelector('label[for="service-name"]');
    const emailLabel = document.querySelector('label[for="service-price"]');
    const phoneLabel = document.querySelector('label[for="service-category"]');
    const submitBtn = document.getElementById('update-user-btn');

    if (modalTitle) modalTitle.textContent = idText.includes('EMPL') ? 'Edit Staff Profile' : 'Edit Customer Profile';
    if (nameLabel) nameLabel.textContent = 'Full Name';
    if (emailLabel) emailLabel.textContent = 'Email Address';
    if (phoneLabel) phoneLabel.textContent = 'Phone Number';
    if (submitBtn) {
        submitBtn.textContent = 'Update Profile';
        submitBtn.classList.add('btn-pulse-active');
    }
    
    // Adjust shared modal fields
    const descGroup = document.getElementById('group-service-description');
    const previewGroup = document.getElementById('image-preview-container');
    if (descGroup) descGroup.style.display = 'none';
    if (previewGroup) previewGroup.style.display = 'none';

    // Populate Input Fields
    const nameInput = document.getElementById('service-name');
    const emailInput = document.getElementById('service-price');
    const phoneInput = document.getElementById('service-category'); 
    
    if (nameInput) nameInput.value = name;
    if (emailInput) {
        emailInput.type = 'email';
        emailInput.value = email;
    }
    
    if (phoneInput) {
        // Swap select for text input if needed
        if (phoneInput.tagName === 'SELECT') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'service-category';
            input.value = phone === 'N/A' ? '' : phone;
            phoneInput.parentNode.replaceChild(input, phoneInput);
        } else {
            phoneInput.value = phone === 'N/A' ? '' : phone;
        }
    }

    // Show the modal
    const modalOverlay = document.getElementById('admin-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Attach local submit handler
    const form = document.getElementById('service-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await saveUserChanges();
        };
    }
};

/**
 * Save User Changes - Call Backend API
 */
async function saveUserChanges() {
    const userId = window.currentEditingUserId;
    if (!userId) {
        console.error("❌ [UserModal] No User ID set for update");
        return;
    }

    const full_name = document.getElementById('service-name').value;
    const email = document.getElementById('service-price').value;
    const phone = document.getElementById('service-category').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${window.API_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ full_name, email, phone })
        });

        const data = await response.json();

        if (data.success) {
            window.showSuccessToast('User profile updated successfully!');
            
            // Close Modal
            const modalOverlay = document.getElementById('admin-modal-overlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            resetModalToServiceDefaults();
            if (typeof loadUsers === 'function') loadUsers(window.currentRole || 'customer');
            if (typeof fetchStaffList === 'function') fetchStaffList();
        } else {
            alert(data.message || 'Update failed.');
        }
    } catch (err) {
        console.error("❌ [UserModal] PUT Error:", err);
        alert('Server error while updating user.');
    }
}

function resetModalToServiceDefaults() {
    const descGroup = document.getElementById('group-service-description');
    const previewGroup = document.getElementById('image-preview-container');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('update-user-btn');
    
    if (descGroup) descGroup.style.display = 'block';
    if (previewGroup) previewGroup.style.display = 'flex';
    if (modalTitle) modalTitle.textContent = 'Modify Service';
    if (submitBtn) {
        submitBtn.textContent = 'Update Service';
        submitBtn.classList.remove('btn-pulse-active');
    }

    const phoneInput = document.getElementById('service-category');
    if (phoneInput && phoneInput.tagName === 'INPUT') {
        const select = document.createElement('select');
        select.id = 'service-category';
        select.innerHTML = `
            <option value="exterior">Exterior</option>
            <option value="interior">Interior</option>
            <option value="detailing">Detailing</option>
            <option value="package">Package</option>
        `;
        phoneInput.parentNode.replaceChild(select, phoneInput);
    }
}

// Global Exports
window.initUserModal = initUserModal;
window.saveUserChanges = saveUserChanges;
window.resetModalToServiceDefaults = resetModalToServiceDefaults;
