/**
 * Admin Dashboard Loader - Component Injection Engine
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin Dashboard Loader Initializing...');

    // 1. Load Core Layout Components
    await loadComponent('admin-sidebar-placeholder', '/frontend/admin/html/admin_components/sidebar.html');
    await loadComponent('admin-header-placeholder', '/frontend/admin/html/admin_components/admin-header.html');
    await loadComponent('admin-modal-placeholder', '/frontend/admin/html/admin_components/admin-modal.html');
    await loadComponent('add-user-modal-placeholder', '/frontend/admin/html/admin_components/add-user-modal.html');

    // 2. Fetch Employees for Global Use
    await fetchEmployees();

    // 3. Load Default Content (Dashboard Overview)
    await loadContent('dashboard-overview');

    // 4. Initialize Shared Interactivity
    initSidebarToggle();
    initGlobalListeners();
});

/**
 * Loads an HTML component into a placeholder
 */
async function loadComponent(placeholderId, filePath) {
    try {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load component: ${filePath}`);
        
        const html = await response.text();
        placeholder.innerHTML = html;
        console.log(`Component loaded: ${filePath}`);
    } catch (error) {
        console.error('Loader Error:', error);
    }
}

/**
 * Loads dynamic content into the main content placeholder
 */
async function loadContent(componentName) {
    const filePath = `/frontend/admin/html/admin_components/${componentName}.html`;
    const placeholder = document.getElementById('admin-content-placeholder');
    
    if (!placeholder) return;

    try {
        // Show loading state
        placeholder.innerHTML = '<div class="loader-container"><div class="spinner"></div></div>';
        
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load content: ${filePath}`);
        
        const html = await response.text();
        placeholder.innerHTML = html;
        
        // Reset scroll to top
        const mainContent = document.querySelector('.admin-main');
        if (mainContent) mainContent.scrollTop = 0;

        // Re-initialize component-specific logic
        reinitComponentLogic(componentName);
        
        // Update Title
        updatePageTitle(componentName);

    } catch (error) {
        placeholder.innerHTML = `<div class="error-msg">Error loading ${componentName}. Please try again later.</div>`;
        console.error('Content Loader Error:', error);
    }
}

/**
 * Re-initializes logic for components based on their name
 */
function reinitComponentLogic(name) {
    if (name === 'dashboard-overview') {
        initDashboardStats();
        initRecentBookings();
    } else if (name === 'user-management') {
        if (typeof initManagementTabs === 'function') initManagementTabs();
        if (typeof initUserManagementLogic === 'function') initUserManagementLogic();
    } else if (name === 'staff-management') {
        if (typeof initStaffManagement === 'function') initStaffManagement();
    } else if (name === 'service-management') {
        if (typeof initServiceManagementLogic === 'function') initServiceManagementLogic();
        if (typeof initModalLogic === 'function') initModalLogic();
    } else if (name === 'revenue-reports') {
        if (typeof initRevenueDashboard === 'function') initRevenueDashboard();
    } else if (name === 'reports-feedback') {
        if (typeof initFeedbackLogic === 'function') initFeedbackLogic();
    } else if (name === 'booking-control') {
        if (typeof initBookingControl === 'function') initBookingControl();
    } else if (name === 'system-settings') {
        if (typeof initSettingsLogic === 'function') initSettingsLogic();
    }
}

/**
 * Updates the header title based on component
 */
function updatePageTitle(name) {
    const titleMap = {
        'dashboard-overview': 'Dashboard Overview',
        'user-management': 'User Management',
        'service-management': 'Service Management',
        'booking-control': 'Booking Control Center',
        'revenue-reports': 'Financial Revenue Reports',
        'reports-feedback': 'Customer Feedback & Support'
    };
    
    const pageTitle = document.getElementById('page-title');
    if (pageTitle && titleMap[name]) {
        pageTitle.textContent = titleMap[name];
    }
}

/**
 * Global Listeners (Delegation)
 */
function initGlobalListeners() {
    // Sidebar link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link');
        if (link && link.hasAttribute('data-component')) {
            e.preventDefault();
            const component = link.getAttribute('data-component');
            
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            loadContent(component);
        }
    });

    // Close Modal Logic (Delegation)
    document.addEventListener('click', (e) => {
        if (e.target.closest('#close-modal-btn') || e.target.closest('#cancel-modal-btn') || e.target.id === 'admin-modal-overlay') {
            const modal = document.getElementById('admin-modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

function initSidebarToggle() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'menu-toggle' || e.target.closest('#menu-toggle')) {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar) sidebar.classList.toggle('open');
        }
    });
}

/**
 * Fetch and display real-time dashboard stats
 */
async function initDashboardStats() {
    const token = localStorage.getItem('token');
    const redirectUrl = '/frontend/admin/html/loginportal.html';
    
    if (!token) return window.location.replace(redirectUrl);

    try {
        const response = await fetch(`${window.API_URL}/admin/stats`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            return window.location.replace(redirectUrl);
        }

        const json = await response.json();
        if (json.success) {
            const data = json.data;
            const revEl = document.getElementById('stat-revenue');
            const bookEl = document.getElementById('stat-bookings'); 
            const custEl = document.getElementById('stat-customers');
            const pendEl = document.getElementById('stat-pending'); 

            if (revEl) revEl.textContent = `Rs. ${data.totalRevenue.toLocaleString()}`;
            if (bookEl) bookEl.textContent = data.totalPending; 
            if (custEl) custEl.textContent = data.totalCustomers;
            if (pendEl) pendEl.textContent = data.totalPending;
        }
    } catch (err) {
        console.error("Failed to load admin stats:", err);
    }
}

/**
 * Fetch employees for task assignment
 */
async function fetchEmployees() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${window.API_URL}/admin/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        if (json.success) {
            window.employeeList = json.data;
        }
    } catch (err) {
        console.error("Failed to fetch employees:", err);
    }
}

/**
 * Fetch and display recent bookings table
 */
async function initRecentBookings() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${window.API_URL}/admin/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        
        if (json.success) {
            const tbody = document.getElementById('recent-bookings-list');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            json.data.forEach(booking => {
                let badgeStyle = "padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;";
                if (booking.status === 'pending') {
                    badgeStyle += " background: rgba(255, 165, 0, 0.2); color: orange; border: 1px solid orange;";
                } else if (booking.status === 'assigned') {
                    badgeStyle += " background: rgba(0, 123, 255, 0.2); color: #007bff; border: 1px solid #007bff;";
                } else if (booking.status === 'completed') {
                    badgeStyle += " background: rgba(0, 255, 148, 0.2); color: #00ff94; border: 1px solid #00ff94;";
                } else {
                    badgeStyle += " background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255,255,255,0.3);";
                }

                let actionHtml = '';
                if (booking.status === 'pending') {
                    const options = (window.employeeList || []).map(emp => `<option value="${emp.id}">${emp.full_name}</option>`).join('');
                    actionHtml = `
                        <div style="display: flex; gap: 5px;">
                            <select id="emp-select-${booking.id}" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 2px; border-radius: 5px; font-size: 0.8rem;">
                                <option value="">Select Employee</option>
                                ${options}
                            </select>
                            <button onclick="assignTask(${booking.id})" style="background: var(--accent-green); color: black; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">Assign</button>
                        </div>
                    `;
                } else {
                    actionHtml = `<span style="color: var(--text-dim); font-size: 0.8rem;">${booking.status === 'assigned' ? 'Assigned' : 'Task Finished'}</span>`;
                }

                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
                tr.innerHTML = `
                    <td style="padding: 15px;">#BK-${booking.id}</td>
                    <td style="padding: 15px;">${booking.customer_name}</td>
                    <td style="padding: 15px;">${booking.make_model} (${booking.plate_number})</td>
                    <td style="padding: 15px; text-transform: capitalize;">${booking.service_type.replace('_', ' ')}</td>
                    <td style="padding: 15px;">${new Date(booking.booking_date).toLocaleDateString()} ${booking.booking_time}</td>
                    <td style="padding: 15px;"><span style="${badgeStyle}">${booking.status}</span></td>
                    <td style="padding: 15px;">${actionHtml}</td>
                `;
                tbody.appendChild(tr);
            });
            
            if (json.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="padding: 15px; text-align: center; color: var(--text-dim);">No recent bookings found.</td></tr>';
            }
        }
    } catch (err) {
        console.error("Failed to load recent bookings:", err);
    }
}

window.assignTask = async function(bookingId) {
    const empSelect = document.getElementById(`emp-select-${bookingId}`);
    const employeeId = empSelect?.value;
    const token = localStorage.getItem('token');

    if (!employeeId) {
        alert("Please select an employee first.");
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/admin/bookings/${bookingId}/assign`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ employee_id: employeeId })
        });

        const data = await response.json();
        if (data.success) {
            window.showSuccessToast("Task Assigned Successfully!");
            initRecentBookings(); 
        } else {
            alert(data.message || "Failed to assign task.");
        }
    } catch (err) {
        console.error("Assignment error:", err);
        alert("An error occurred during assignment.");
    }
}
