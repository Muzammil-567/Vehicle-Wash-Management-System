/**
 * Staff Management Handler - Logic for staff members table and registration
 */

window.initStaffManagement = function () {
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
        console.log(`📡 [StaffHandler] Fetching staff from: ${window.API_URL}/admin/employees`);
        const response = await fetch(window.API_URL + "/admin/employees", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [StaffHandler] API Error (${response.status}):`, errorText);
            tableBody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #ff4757;">Error ${response.status}: Failed to load staff data.</td></tr>`;
            return;
        }

        const json = await response.json();
        console.log("✅ [StaffHandler] Staff data received:", json);

        if (json.success) {
            if (countEl) countEl.textContent = json.data.length;
            
            if (json.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: var(--text-dim);">No staff members found in database.</td></tr>';
                return;
            }

            tableBody.innerHTML = json.data.map(staff => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 15px;">#EMPL-${staff.id}</td>
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
        console.error("🔥 [StaffHandler] Critical Fetch Crash:", err);
        tableBody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #ff4757;">Network Error: Could not connect to server.</td></tr>`;
    }
}

async function addStaff() {
    const full_name = document.getElementById('staff-name').value;
    const email = document.getElementById('staff-email').value;
    const phone = document.getElementById('staff-phone').value;
    const password = document.getElementById('staff-password').value;

    try {
        const response = await fetch(window.API_URL + "/admin/users", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                full_name,
                email,
                phone,
                password,
                role: 'employee'
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccessToast("New Staff Registered Successfully!");
            document.getElementById('add-staff-form').reset();
            document.getElementById('add-staff-modal').style.display = 'none';
            fetchStaffList();
        } else {
            alert(data.message || "Failed to add staff.");
        }
    } catch (err) {
        console.error("Add staff error:", err);
        alert("Server error. Please try again.");
    }
}

window.deleteStaff = async function (id, name) {
    if (!confirm(`Are you sure you want to delete staff member "${name}"?`)) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${window.API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            showSuccessToast("Staff member removed successfully!");
            fetchStaffList();
        } else {
            alert(data.message || "Failed to remove staff.");
        }
    } catch (err) {
        console.error("Delete staff error:", err);
        alert("Server error. Please try again.");
    }
};

window.fetchStaffList = fetchStaffList;
