/**
 * GlossFlow Customer Dashboard - SPA Navigation Engine
 * Handles Tab switching, content loading, and visual transitions.
 * Supports Dual Shell: Desktop (desktop-shell) + Mobile (mobile-shell)
 */

window.Navigation = {

    init() {
        // Bind both sidebar nav-items AND mobile bottom nav items
        const navItems = document.querySelectorAll('.nav-item[data-tab]');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                if (!tab) return;
                this.goToTab(tab);
            });
        });

        // Set initial tab content to 'home'
        this.goToTab('home');

        console.log('[Navigation] SPA Navigation Initialized');
    },

    goToTab(tabName) {
        // Sync all nav items (both sidebar + mobile)
        document.querySelectorAll('.nav-item[data-tab]').forEach(nav => {
            if (nav.dataset.tab === tabName) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        // Update page title in topbar
        const titleMap = {
            home: 'Dashboard',
            bookings: 'My Reservations',
            garage: 'My Garage',
            rewards: 'Rewards Hub',
            help: 'Help Center',
            profile: 'My Profile',
        };

        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = titleMap[tabName] || 'Dashboard';

        // Switch content in BOTH shells
        this.switchTab(tabName, 'main-content');
        this.switchTab(tabName, 'main-content-mobile');
    },

    async switchTab(tabName, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Outgoing transition
        container.style.opacity = '0';
        container.style.transform = 'translateY(12px)';

        setTimeout(async () => {
            container.innerHTML = '';
            let success = false;

            switch (tabName) {
                case 'home':
                    container.innerHTML = this.getHomeContent();
                    success = await this.loadFragment('booking-wizard-mount', '/frontend/customer/html/customer_components/booking-wizard.html');
                    if (success && window.initBookingWizard) window.initBookingWizard();
                    if (typeof fetchMyBookings === 'function') fetchMyBookings();
                    break;

                case 'garage':
                    success = await this.loadFragment(containerId, '/frontend/customer/html/customer_components/my-garage.html');
                    if (success && window.initGarage) window.initGarage();
                    break;

                case 'rewards':
                    success = await this.loadFragment(containerId, '/frontend/customer/html/customer_components/loyalty-rewards.html');
                    if (success && window.initLoyalty) window.initLoyalty();
                    break;

                case 'help':
                    success = await this.loadFragment(containerId, '/frontend/customer/html/customer_components/help-center.html');
                    break;

                case 'bookings':
                    success = await this.loadFragment(containerId, '/frontend/customer/html/customer_components/booking-history.html');
                    if (success && window.initHistory) window.initHistory();
                    break;

                case 'profile':
                    success = await this.loadFragment(containerId, '/frontend/customer/html/customer_components/customer-profile.html');
                    if (success && window.initProfile) window.initProfile();
                    break;

                default:
                    container.innerHTML = `<div class="empty-state"><h3>${tabName}</h3><p>Content coming soon.</p></div>`;
                    success = true;
            }

            if (!success) {
                container.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Failed to Load</h3>
                        <p>We couldn't retrieve the "${tabName}" content. Please try again.</p>
                    </div>`;
            }

            // Incoming transition
            requestAnimationFrame(() => {
                container.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            });

        }, 180);
    },

    async loadFragment(containerId, url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
            const html = await res.text();
            const container = document.getElementById(containerId);
            if (container) container.innerHTML = html;
            return true;
        } catch (err) {
            console.error('[Navigation] Load error:', err);
            return false;
        }
    },

    getHomeContent() {
        return `
            <!-- Live Tracking Section -->
            <div id="live-tracker-container" class="animate-fade-in" style="margin-bottom: 40px;">
                <h3 style="color: var(--neon-blue); margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center;">
                    <span class="pulse-dot" style="margin-right: 12px;"></span> Live Garage Tracker
                </h3>
                <div id="active-wash-list" class="active-wash-grid">
                    <div style="background: var(--card-bg); padding: 30px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-align: center; color: var(--text-dim);">
                        Checking active washes...
                    </div>
                </div>
            </div>

            <div class="wizard-page-wrapper animate-fade-in-up">
                <div id="booking-wizard-mount"></div>
            </div>
        `;
    }
};
