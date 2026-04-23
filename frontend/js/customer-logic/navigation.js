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
                    success = true;
                    break;

                case 'garage':
                    success = await this.loadFragment(containerId, 'customer_components/my-garage.html');
                    if (success && window.initGarage) window.initGarage();
                    break;

                case 'rewards':
                    success = await this.loadFragment(containerId, 'customer_components/loyalty-rewards.html');
                    if (success && window.initLoyalty) window.initLoyalty();
                    break;

                case 'help':
                    success = await this.loadFragment(containerId, 'customer_components/help-center.html');
                    break;

                case 'bookings':
                    success = await this.loadFragment(containerId, 'customer_components/booking-history.html');
                    if (success && window.initHistory) window.initHistory();
                    break;

                case 'profile':
                    success = await this.loadFragment(containerId, 'customer_components/customer-profile.html');
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
            <section class="home-welcome animate-fade-in-up">
                <div class="welcome-text">
                    <h1>Good evening, Alex 👋</h1>
                    <p>Ready to give your ride the shine it deserves?</p>
                </div>
                <button class="btn-book-now" id="btn-book-now" onclick="window.Navigation && window.Navigation.goToTab('bookings')">
                    <i class="fas fa-calendar-plus"></i> Book a Session
                </button>
            </section>

            <section class="quick-status-banner animate-fade-in-up">
                <div class="status-banner-inner">
                    <div class="status-banner-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="status-banner-text">
                        <span class="status-caption">Current Status</span>
                        <h3>No Active Booking</h3>
                    </div>
                    <button class="btn-primary-sm" onclick="window.Navigation && window.Navigation.goToTab('bookings')">
                        Book Now <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </section>

            <section class="discovery-section animate-fade-in-up">
                <h3 class="section-title">Recommended for You</h3>
                <div class="discovery-grid">
                    <div class="discovery-card" onclick="window.Navigation && window.Navigation.goToTab('bookings')">
                        <div class="disc-icon" style="background: rgba(0,255,148,0.1); color: var(--neon-green);">
                            <i class="fas fa-gem"></i>
                        </div>
                        <span class="disc-badge">Save 20%</span>
                        <h4>Ceramic Coating</h4>
                        <p>Long-lasting diamond shine protection</p>
                    </div>
                    <div class="discovery-card" onclick="window.Navigation && window.Navigation.goToTab('bookings')">
                        <div class="disc-icon" style="background: rgba(0,163,255,0.1); color: var(--neon-blue);">
                            <i class="fas fa-infinity"></i>
                        </div>
                        <span class="disc-badge">Best Value</span>
                        <h4>Unlimited Plan</h4>
                        <p>Wash every day for a fixed price</p>
                    </div>
                    <div class="discovery-card" onclick="window.Navigation && window.Navigation.goToTab('bookings')">
                        <div class="disc-icon" style="background: rgba(255,200,0,0.1); color: #ffca28;">
                            <i class="fas fa-broom"></i>
                        </div>
                        <span class="disc-badge">Trending</span>
                        <h4>Interior Detail</h4>
                        <p>Full cabin restoration & sanitization</p>
                    </div>
                </div>
            </section>
        `;
    }
};
