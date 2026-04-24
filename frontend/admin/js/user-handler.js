/**
 * User Management Handler - Tables and Tab Logic
 */

window.currentRole = 'customer';

/**
 * Initializes User Management logic
 */
function initUserManagementLogic() {
    console.log('Initializing User Management Logic...');
    initManagementTabs();
    if (typeof initUserModal === 'function') initUserModal(); 
    loadUsers('customer');
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
            window.currentRole = targetId === 'customer-table' ? 'customer' : 'employee';

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            containers.forEach(c => c.classList.remove('active'));
            const targetContainer = document.getElementById(targetId);
            if (targetContainer) targetContainer.classList.add('active');

            loadUsers(window.currentRole);
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

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Fetching users from database...</td></tr>';

    try {
        const response = await fetch(`${window.API_URL}/admin/users?role=${role}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            tbody.innerHTML = '';
            
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
window.deleteUser = async function (id) {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${window.API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            showSuccessToast('User deleted successfully.');
            loadUsers(window.currentRole); 
        } else {
            alert(data.message || 'Failed to delete user.');
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert('Server error while deleting user.');
    }
};

window.initUserManagementLogic = initUserManagementLogic;
window.loadUsers = loadUsers;
