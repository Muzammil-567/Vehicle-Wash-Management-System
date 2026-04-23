/**
 * Employee Dashboard Loader - UI Orchestrator
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Employee Panel Initializing...');

    // 1. Load Core Layout Components
    await loadComponent('employee-header-placeholder', 'employee_components/employee-header.html');
    await loadComponent('duty-status-placeholder', 'employee_components/duty-status.html');
    await loadComponent('duty-status-sidebar-placeholder', 'employee_components/duty-status.html');
    await loadComponent('issue-modal-placeholder', 'employee_components/report-issue.html');
    await loadComponent('notif-banner-placeholder', 'employee_components/notif-banner.html');
    await loadComponent('sidebar-stats-placeholder', 'employee_components/performance-stats.html');
    
    // Initial content load
    await initDashboard();

    // 2. Initialize Logic
    initDutyToggle();
    initNotificationSim();
    initNavigation();
});

/**
 * Main dashboard initialization
 */
async function initDashboard() {
    await loadComponent('task-list-placeholder', 'employee_components/task-list.html');
    loadMockTasks();
}

/**
 * Fetches and injects HTML component
 */
async function loadComponent(placeholderId, filePath) {
    try {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load: ${filePath}`);
        
        const html = await response.text();
        placeholder.innerHTML = html;
    } catch (error) {
        console.error('Loader Error:', error);
    }
}

/**
 * Duty Toggle Logic (On-Duty / Off-Duty states)
 */
function initDutyToggle() {
    const toggle = document.getElementById('duty-toggle');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            const isOffDuty = !e.target.checked;
            const body = document.body;
            
            if (isOffDuty) {
                console.log('Employee is now OFF-DUTY');
                // Dim the UI slightly or show off-duty overlay
                document.querySelector('.employee-dashboard').style.opacity = '0.7';
            } else {
                console.log('Employee is now ON-DUTY');
                document.querySelector('.employee-dashboard').style.opacity = '1';
            }
        });
    }
}

/**
 * Mock Task Data & Injection
 */
function loadMockTasks() {
    const container = document.getElementById('active-tasks-container');
    if (!container) return;

    const mockTasks = [
        { id: '1', service: 'Hydro-Dynamic Exterior', vehicle: 'Honda Civic - Black', plate: 'ABC-1234', bay: '03', time: '02:30 PM', status: 'pending' },
        { id: '2', service: 'Deep Interior Sanitization', vehicle: 'Tesla Model 3 - White', plate: 'EV-9921', bay: '01', time: '03:15 PM', status: 'in-progress' },
        { id: '3', service: 'Ceramic Wax Application', vehicle: 'Toyota Camry - Blue', plate: 'CAM-552', bay: '05', time: '04:00 PM', status: 'pending' }
    ];

    container.innerHTML = ''; // Clear loader

    mockTasks.forEach(task => {
        const card = createTaskCard(task);
        container.appendChild(card);
    });
}

/**
 * Creates a task card element from data
 */
function createTaskCard(task) {
    const div = document.createElement('div');
    div.className = `task-card animate-on-scroll ${task.status}`;
    div.id = `task-${task.id}`;
    div.dataset.status = task.status;
    
    div.innerHTML = `
        <!-- Tier 1: Service & Time Slot -->
        <div class="task-tier tier-top">
            <div class="service-meta">
                <h3 class="service-title">${task.service}</h3>
                <span class="booking-id">#BK-${8000 + parseInt(task.id)}</span>
            </div>
            <span class="time-slot">${task.time}</span>
        </div>

        <!-- Tier 2: Vehicle Core Info -->
        <div class="task-tier tier-middle">
            <div class="vehicle-icon-box">
                <i class="fas fa-car-side"></i>
            </div>
            <div class="vehicle-details">
                <h4>${task.vehicle}</h4>
                <div class="vehicle-subtexts">
                    <span>Plate: ${task.plate}</span>
                    <span class="bay-tag">Bay ${task.bay}</span>
                </div>
            </div>
        </div>

        <!-- Tier 3: Actions & Progress -->
        <div class="task-tier tier-bottom">
            <div class="task-actions">
                <button class="task-btn btn-start" onclick="updateJobStatus('${task.id}', 'in-progress')">
                    <i class="fas fa-play"></i> Start
                </button>
                <button class="task-btn btn-complete" onclick="updateJobStatus('${task.id}', 'completed')">
                    <i class="fas fa-check"></i> Complete
                </button>
            </div>
            
            <div class="completed-badge">
                <i class="fas fa-check-circle"></i> JOB COMPLETED
            </div>

            <div class="task-footer-actions">
                <button class="issue-btn" onclick="openIssueModal('${task.id}')">
                    <i class="fas fa-exclamation-triangle"></i> Report Issue
                </button>
                <div class="task-progress-container">
                    <div class="progress-bar" style="width: ${task.status === 'pending' ? '0%' : (task.status === 'in-progress' ? '50%' : '100%')}"></div>
                </div>
            </div>
        </div>
    `;
    return div;
}

/**
 * Status Update Logic (Legacy Wrapper)
 */
window.updateTaskStatus = function(taskId, newStatus) {
    // Redirect to the new StatusEngine
    if (window.updateJobStatus) {
        window.updateJobStatus(taskId, newStatus);
    }
}

/**
 * Notification Simulation
 */
function initNotificationSim() {
    // Just a visual simulation for the "New Task" vibe
    setTimeout(() => {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.style.transform = 'scale(1.5)';
            setTimeout(() => badge.style.transform = 'scale(1)', 400);
        }
    }, 5000);
}

/**
 * Navigation & Tab Switching Logic
 */
function initNavigation() {
    const navElements = document.querySelectorAll('.nav-item, .sidebar-link');
    
    navElements.forEach(item => {
        item.addEventListener('click', async (e) => {
            const tab = item.dataset.tab;
            if (!tab) return;

            // Update UI for all nav elements (syncing mobile and desktop)
            navElements.forEach(i => {
                if (i.dataset.tab === tab) {
                    i.classList.add('active');
                } else {
                    i.classList.remove('active');
                }
            });

            await switchTab(tab);
        });
    });
}

async function switchTab(tabName) {
    const main = document.getElementById('task-list-placeholder');
    if (!main) return;

    // Fade out effect
    main.style.opacity = '0';
    
    setTimeout(async () => {
        if (tabName === 'tasks') {
            await loadComponent('task-list-placeholder', 'employee_components/task-list.html');
            loadMockTasks();
        } else if (tabName === 'history') {
            // Load Performance Stats and then History List
            main.innerHTML = `
                <div id="performance-stats-placeholder"></div>
                <div id="job-history-placeholder"></div>
            `;
            await loadComponent('performance-stats-placeholder', 'employee_components/performance-stats.html');
            await loadComponent('job-history-placeholder', 'employee_components/job-history.html');
            
            loadHistoryData();
            checkExcellence();
        } else if (tabName === 'profile') {
            await loadComponent('task-list-placeholder', 'employee_components/profile-view.html');
        }
        main.style.opacity = '1';
    }, 300);
}

/**
 * Job History & Stats Logic
 */
function loadHistoryData() {
    const historyContainer = document.getElementById('history-list-container');
    if (!historyContainer) return;

    const mockHistory = [
        { id: 'H1', customer: 'Sarah Miller', vehicle: 'Audi A4 - White', service: 'Full Exterior Wash', date: '2026-04-18', status: 'Completed' },
        { id: 'H2', customer: 'James Wilson', vehicle: 'BMW X5 - Black', service: 'Interior Detailing', date: '2026-04-17', status: 'Completed' },
        { id: 'H3', customer: 'Emily Chen', vehicle: 'Tesla Model S - Red', service: 'Ceramic Coating', date: '2026-04-17', status: 'Completed' },
        { id: 'H4', customer: 'Michael Brown', vehicle: 'Ford F-150 - Grey', service: 'Engine Bay Cleaning', date: '2026-04-16', status: 'Completed' }
    ];

    historyContainer.innerHTML = '';

    mockHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-card';
        div.innerHTML = `
            <!-- Column 1: Identity -->
            <div class="history-col col-identity">
                <h4 class="history-customer">${item.customer}</h4>
                <div class="history-vehicle">
                    <i class="fas fa-car-side"></i> ${item.vehicle}
                </div>
            </div>

            <!-- Column 2: Service Focus -->
            <div class="history-col col-service">
                <span class="service-label">Service</span>
                <div class="history-service-main">${item.service}</div>
            </div>

            <!-- Column 3: Meta & Status -->
            <div class="history-col col-meta">
                <span class="history-date">${item.date}</span>
                <span class="history-status status-pill">${item.status}</span>
            </div>
        `;
        historyContainer.appendChild(div);
    });
}

function checkExcellence() {
    const jobs = parseInt(document.getElementById('stat-total-jobs')?.textContent || '0');
    const rating = parseFloat(document.getElementById('stat-avg-rating')?.textContent || '0');
    const placeholder = document.getElementById('excellence-badge-placeholder');

    if (placeholder && jobs >= 50 && rating >= 4.5) {
        placeholder.innerHTML = `<div class="excellence-badge" title="Certificate of Excellence"><i class="fas fa-award"></i></div>`;
    }
}

window.filterHistory = function() {
    const query = document.getElementById('history-search').value.toLowerCase();
    const cards = document.querySelectorAll('.history-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
    });
}
