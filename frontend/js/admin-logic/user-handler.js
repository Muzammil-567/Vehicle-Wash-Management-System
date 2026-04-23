/**
 * User Management Handler - Logic for Customer and Employee Tables
 */

/**
 * Initializes User Management logic
 * Called by admin-loader.js when the user-management component is loaded
 */
let currentRole = 'customer';

/**
 * Initializes User Management logic
 */
function initUserManagementLogic() {
    console.log('Initializing User Management Logic...');
    initManagementTabs();
    initUserModal(); 
    loadUsers('customer'); // Initial load

    // Task 2: Direct Event Listener for Update Button
    const updateBtn = document.getElementById('update-user-btn');
    if (updateBtn) {
        // Use a flag or check to ensure we only attach once if needed, 
        // but here we'll follow the user's direct request.
        updateBtn.addEventListener('click', async (e) => {
            // Only execute this logic if we are editing a user, not a service
            if (!window.currentEditingUserId) return; 

            e.preventDefault();
            console.log("🚀 Update button clicked!"); 

            const fullName = document.querySelector('.edit-full-name').value;
            const email = document.querySelector('.edit-email').value;
            const phone = document.querySelector('.edit-phone').value;
            const userId = window.currentEditingUserId; 

            try {
                const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ full_name: fullName, email, phone })
                });

                if (response.ok) {
                    alert("✅ User updated successfully!");
                    location.reload(); 
                } else {
                    const errData = await response.json();
                    console.error("❌ Update failed:", errData);
                    alert("Error: " + errData.message);
                }
            } catch (err) {
                console.error("Update Error:", err);
            }
        });
    }
}

/**
 * Add User Modal Logic
 */
function initUserModal() {
    const openBtn = document.querySelector('.btn-add-user');
    const modal = document.getElementById('add-user-modal-overlay');
    const closeBtns = [document.getElementById('close-user-modal'), document.getElementById('cancel-user-modal')];
    const form = document.getElementById('add-user-form');

    if (openBtn) {
        openBtn.onclick = () => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };
    }

    closeBtns.forEach(btn => {
        if (btn) {
            btn.onclick = () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                form.reset();
            };
        }
    });

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const userData = {
                full_name: document.getElementById('user-full-name').value,
                email: document.getElementById('user-email').value,
                phone: document.getElementById('user-phone').value,
                password: document.getElementById('user-password').value,
                role: document.getElementById('user-role').value
            };

            try {
                const response = await fetch('http://localhost:5000/api/admin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();
                if (data.success) {
                    showSuccessToast(data.message);
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                    form.reset();
                    loadUsers(currentRole); // Refresh the active list
                } else {
                    alert(data.message || 'Failed to create user.');
                }
            } catch (err) {
                console.error("Add User Error:", err);
                alert('Server error while creating user.');
            }
        };
    }
}

/**
 * Tab Switching Logic
 */
function initManagementTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const containers = document.querySelectorAll('.admin-table-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            currentRole = targetId === 'customer-table' ? 'customer' : 'employee';

            // UI: Active Tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // UI: Show Table
            containers.forEach(c => c.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            loadUsers(currentRole);
        });
    });
}

/**
 * Real-Time Fetching
 */
async function loadUsers(role) {
    const tableId = role === 'customer' ? 'customer-table' : 'employee-table';
    const tbody = document.querySelector(`#${tableId} tbody`);
    const token = localStorage.getItem('token');

    if (!tbody || !token) return;

    // Show Loading
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Fetching users from database...</td></tr>';

    try {
        const response = await fetch(`http://localhost:5000/api/admin/users?role=${role}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            tbody.innerHTML = ''; // Clear loading
            
            if (json.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No ${role}s found in system.</td></tr>`;
                return;
            }

            json.data.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${role.toUpperCase().substring(0, 4)}-${user.id}</td>
                    <td style="font-weight: bold; color: white;">${user.full_name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td style="text-align: center;">${user.total_bookings}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn btn-edit" onclick="handleUserEdit(this)" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="action-btn btn-delete" onclick="deleteUser(${user.id})" title="Delete" style="color: #ff4757;"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Failed to load users:", err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Connection error.</td></tr>';
    }
}

/**
 * Delete Logic
 */
window.deleteUser = async function(id) {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            alert('User deleted successfully.');
            loadUsers(currentRole); // Refresh view
        } else {
            alert(data.message || 'Failed to delete user.');
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert('Server error while deleting user.');
    }
};

/**
 * Event Delegation for Edit/Delete buttons
 */
function handleUserActions(e) {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
        handleUserEdit(editBtn);
    } else if (deleteBtn) {
        handleUserDelete(deleteBtn);
    }
}

/**
 * Handles User Deletion with Confirmation and Animations
 */
function handleUserDelete(btn) {
    const row = btn.closest('tr');
    const userName = row.cells[1].textContent;

    // Custom Neon Confirmation (SweetAlert Style)
    if (confirm(`ARE YOU SURE?\n\nYou are about to permanently remove "${userName}" from the system. This action cannot be undone.`)) {
        
        // UI Feedback: Red Flash Effect
        row.classList.add('row-flash-red');

        // Success Notification and Removal
        setTimeout(() => {
            row.remove();
            showSuccessToast("User record updated successfully.");
        }, 600); // Matches animation duration
    }
}

/**
 * Handles User Editing - Populates Shared Admin Modal
 */
let currentEditingUserId = null;

function handleUserEdit(btn) {
    const row = btn.closest('tr');
    const isEmployee = row.closest('#employee-table') !== null;
    
    // Extract Data - Improved parsing
    const idText = row.cells[0].textContent; // e.g. #CUST-10 or #EMPL-5
    window.currentEditingUserId = idText.split('-').pop(); // Get numeric ID
    
    const name = row.cells[1].textContent;
    const email = row.cells[2].textContent;
    const phone = row.cells[3].textContent;

    // Update Modal Labels for User Editing
    const modalTitle = document.getElementById('modal-title');
    const nameLabel = document.querySelector('label[for="service-name"]');
    const priceLabel = document.querySelector('label[for="service-price"]');
    const categoryLabel = document.querySelector('label[for="service-category"]');
    const descLabel = document.querySelector('label[for="service-description"]');

    if (modalTitle) modalTitle.textContent = isEmployee ? 'Edit Employee Details' : 'Edit Customer Details';
    if (nameLabel) nameLabel.textContent = 'Full Name';
    if (priceLabel) priceLabel.textContent = 'Email Address';
    if (categoryLabel) categoryLabel.textContent = 'Phone Number';
    
    // Hide service-specific fields that aren't needed for basic user edit
    const categoryGroup = document.getElementById('group-service-category');
    const descGroup = document.getElementById('group-service-description');
    const previewGroup = document.getElementById('image-preview-container');
    
    if (categoryGroup) categoryGroup.style.display = 'block'; // We'll use this for phone
    if (descGroup) descGroup.style.display = 'none';
    if (previewGroup) previewGroup.style.display = 'none';

    // Populate Fields
    const nameInput = document.getElementById('service-name');
    const emailInput = document.getElementById('service-price');
    const phoneInput = document.getElementById('service-category'); // Reusing category select as a text input for phone
    
    if (nameInput) nameInput.value = name;
    
    if (emailInput) {
        emailInput.type = 'email';
        emailInput.value = email;
    }

    // Convert category select to text input temporarily if needed, or just use a new field
    // For now, let's just use the existing ones but change labels.
    if (phoneInput) {
        // Since it's a <select>, let's replace it with an input if it's not already
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

    // Refresh floating labels
    document.querySelectorAll('.form-group input').forEach(input => {
        if (input.value) input.parentElement.classList.add('has-content');
        else input.parentElement.classList.remove('has-content');
    });

    // Open Modal
    const modalOverlay = document.getElementById('admin-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Attach Submit Handler
    const form = document.getElementById('service-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        saveUserChanges();
    };
}

/**
 * Save User Changes - Call Backend API
 */
async function saveUserChanges() {
    if (!currentEditingUserId) return;

    const full_name = document.getElementById('service-name').value;
    const email = document.getElementById('service-price').value;
    const phone = document.getElementById('service-category').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${currentEditingUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ full_name, email, phone })
        });

        const data = await response.json();

        if (data.success) {
            showSuccessToast('User profile updated successfully!');
            
            // Close Modal
            const modalOverlay = document.getElementById('admin-modal-overlay');
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';

            // Reset the modal fields to service defaults when closing (optional but good)
            resetModalToServiceDefaults();

            // Refresh the active tables
            if (typeof loadUsers === 'function') loadUsers(currentRole);
            if (typeof fetchStaffList === 'function') fetchStaffList();
        } else {
            alert(data.message || 'Update failed.');
        }
    } catch (err) {
        console.error("Update User Error:", err);
        alert('Server error while updating user.');
    }
}

function resetModalToServiceDefaults() {
    // This helper resets the shared modal labels/fields
    const categoryGroup = document.getElementById('group-service-category');
    const descGroup = document.getElementById('group-service-description');
    const previewGroup = document.getElementById('image-preview-container');
    
    if (categoryGroup) categoryGroup.style.display = 'block';
    if (descGroup) descGroup.style.display = 'block';
    if (previewGroup) previewGroup.style.display = 'flex';

    // Revert phone input back to select if it was changed
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

/**
 * Professional Neon Success Toast
 */
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'neon-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Ensure it's available globally but initialized controlled
// Ensure it's available globally but initialized controlled
window.initUserManagementLogic = initUserManagementLogic;

/**
 * STAFF MANAGEMENT LOGIC
 */

window.initStaffManagement = function() {
    console.log('Initializing Staff Management Logic...');
    fetchStaffList();

    const openModalBtn = document.getElementById('open-add-staff-modal');
    const closeModalBtn = document.getElementById('close-staff-modal');
    const modal = document.getElementById('add-staff-modal');
    const addStaffForm = document.getElementById('add-staff-form');

    if (openModalBtn && modal) {
        openModalBtn.onclick = () => modal.style.display = 'flex';
    }
    if (closeModalBtn && modal) {
        closeModalBtn.onclick = () => modal.style.display = 'none';
    }

    if (addStaffForm) {
        addStaffForm.onsubmit = async (e) => {
            e.preventDefault();
            await addStaff();
        };
    }
};

async function fetchStaffList() {
    const tableBody = document.getElementById('staff-list-table');
    const countEl = document.getElementById('total-staff-count');
    const token = localStorage.getItem('token');
    if (!tableBody || !token) return;

    try {
        const response = await fetch('http://localhost:5000/api/admin/employees', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            console.log("🔍 Staff Data from DB:", json.data);
            if (countEl) countEl.textContent = json.data.length;
            
            if (json.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: var(--text-dim);">No staff members found.</td></tr>';
                return;
            }

            tableBody.innerHTML = json.data.map(staff => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 15px;">#ST-${staff.id}</td>
                    <td style="padding: 15px; font-weight: bold; color: white;">${staff.full_name}</td>
                    <td style="padding: 15px;">${staff.email || 'N/A'}</td>
                    <td style="padding: 15px;">${staff.phone || 'N/A'}</td>
                    <td style="padding: 15px; color: var(--text-dim); font-size: 0.85rem;">${new Date(staff.created_at || Date.now()).toLocaleDateString()}</td>
                    <td style="padding: 15px; display: flex; gap: 10px;">
                        <button onclick="handleUserEdit(this)" style="background: rgba(0, 255, 148, 0.1); color: var(--accent-green); border: 1px solid var(--accent-green); padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteStaff(${staff.id}, '${staff.full_name}')" style="background: rgba(255, 71, 87, 0.1); color: #ff4757; border: 1px solid #ff4757; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error("Failed to fetch staff:", err);
    }
}

async function addStaff() {
    const full_name = document.getElementById('staff-name').value;
    const email = document.getElementById('staff-email').value;
    const phone = document.getElementById('staff-phone').value;
    const password = document.getElementById('staff-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name,
                email,
                phone,
                password,
                role: 'employee' // Explicitly set role
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("New Staff Registered Successfully!");
            document.getElementById('add-staff-form').reset();
            document.getElementById('add-staff-modal').style.display = 'none';
            fetchStaffList(); // Reload table
        } else {
            alert(data.message || "Failed to add staff.");
        }
    } catch (err) {
        console.error("Add staff error:", err);
        alert("Server error. Please try again.");
    }
}

window.deleteStaff = async function(id, name) {
    if (!confirm(`Are you sure you want to delete staff member "${name}"?`)) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/admin/employees/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            alert("Staff member removed successfully!");
            fetchStaffList();
        } else {
            alert(data.message || "Failed to remove staff.");
        }
    } catch (err) {
        console.error("Delete staff error:", err);
        alert("Server error. Please try again.");
    }
};
