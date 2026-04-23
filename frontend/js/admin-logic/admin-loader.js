/**
 * Admin Dashboard Loader - Component Injection Engine
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin Dashboard Loader Initializing...');

    // 1. Load Core Layout Components
    await loadComponent('admin-sidebar-placeholder', 'admin_components/sidebar.html');
    await loadComponent('admin-header-placeholder', 'admin_components/admin-header.html');
    await loadComponent('admin-modal-placeholder', 'admin_components/admin-modal.html');

    // 2. Load Default Content (Dashboard Overview)
    await loadContent('dashboard-overview');

    // 3. Initialize Shared Interactivity
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
    const filePath = `admin_components/${componentName}.html`;
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
    if (name === 'user-management') {
        if (typeof initManagementTabs === 'function') initManagementTabs();
        if (typeof initUserManagementLogic === 'function') initUserManagementLogic();
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
    // Sidebar link clicks (Handled via delegation for future proofing)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link');
        if (link && link.hasAttribute('data-component')) {
            e.preventDefault();
            const component = link.getAttribute('data-component');
            
            // Update active state
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            loadContent(component);
        }
    });

    // Close Modal Logic (Delegation)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'close-modal-btn' || e.target.id === 'cancel-modal-btn' || e.target.id === 'admin-modal-overlay') {
            const modal = document.getElementById('admin-modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

function initSidebarToggle() {
    // Move sidebar toggle logic here or keep it in a separate utils file
    document.addEventListener('click', (e) => {
        if (e.target.id === 'menu-toggle' || e.target.closest('#menu-toggle')) {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar) sidebar.classList.toggle('open');
        }
    });
}
