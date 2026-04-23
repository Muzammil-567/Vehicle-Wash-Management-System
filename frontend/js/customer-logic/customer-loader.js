/**
 * GlossFlow Customer Dashboard - UI Loader & Orchestrator
 * Loads components into both Desktop and Mobile shells.
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Loader] Customer Panel Initializing...');

    // 1. Load Active Tracking into both shells
    await loadComponent('active-tracking-placeholder', 'customer_components/active-tracking.html');
    await loadComponent('active-tracking-placeholder-mobile', 'customer_components/active-tracking.html');

    // 2. Load Mobile Bottom Navbar
    await loadComponent('customer-navbar-placeholder', 'customer_components/customer-navbar.html');

    // 3. Load Overlays
    await loadComponent('notification-drawer-placeholder', 'customer_components/notification-center.html');
    await loadComponent('feedback-modal-placeholder', 'customer_components/feedback-modal.html');
    await loadComponent('global-search-placeholder', 'customer_components/global-search.html');

    // 4. Initialize Navigation Engine (SPA)
    if (window.Navigation) {
        window.Navigation.init();
    }

    // 5. Animate the topbar in
    animateTopbar();
});

/**
 * Fetches and injects an HTML fragment into a placeholder element.
 */
async function loadComponent(placeholderId, filePath) {
    try {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return false;

        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load: ${filePath} (${response.status})`);

        const html = await response.text();
        placeholder.innerHTML = html;
        return true;
    } catch (error) {
        console.error('[Loader] Component error:', error);
        return false;
    }
}

/**
 * Subtle entrance animation for the topbar
 */
function animateTopbar() {
    const topbar = document.querySelector('.desktop-topbar');
    if (topbar) {
        topbar.style.opacity = '0';
        topbar.style.transform = 'translateY(-10px)';
        requestAnimationFrame(() => {
            topbar.style.transition = 'all 0.5s ease';
            topbar.style.opacity = '1';
            topbar.style.transform = 'translateY(0)';
        });
    }
}
