/**
 * GlossFlow Customer App - Unified Logic Skeleton
 * Handles navigation, view switching, and the Universal Booking Wizard.
 */

const App = {
    init() {
        console.log('[GlossFlow] App Initializing...');
        this.bindEvents();
        this.loadView('home'); // Default view
    },

    bindEvents() {
        // Universal Tab Navigation (Desktop Sidebar + Mobile Bottom Nav)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.loadView(tab);
                this.updateActiveNav(tab);
            });
        });
    },

    updateActiveNav(tab) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.tab === tab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    async loadView(view) {
        const contentArea = document.getElementById('main-content');
        const pageTitle = document.getElementById('page-title');

        // Logic to switch between views
        switch(view) {
            case 'home':
                pageTitle.textContent = 'Dashboard';
                contentArea.innerHTML = this.getDashboardHTML();
                break;
            case 'bookings':
                pageTitle.textContent = 'Book a Service';
                contentArea.innerHTML = this.getBookingWizardHTML();
                this.initWizard();
                break;
            case 'garage':
                pageTitle.textContent = 'My Garage';
                contentArea.innerHTML = '<div class="empty-state">Garage content unified.</div>';
                break;
            case 'profile':
                pageTitle.textContent = 'My Profile';
                contentArea.innerHTML = '<div class="empty-state">Profile settings unified.</div>';
                break;
            default:
                contentArea.innerHTML = '<h2>View Not Found</h2>';
        }
    },

    getDashboardHTML() {
        return `
            <div class="dashboard-overview animate-fade-in">
                <h3 style="font-size: 1.5rem; margin-bottom: 5px;">Welcome back, Alex!</h3>
                <p style="color: var(--text-muted); margin-bottom: 25px;">Select "Bookings" to start a new car wash session.</p>
                <div class="quick-stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                        <div class="stat-details">
                            <h4>Last Wash</h4>
                            <p style="color: var(--neon-green)">2 days ago</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-star"></i></div>
                        <div class="stat-details">
                            <h4>Loyalty Points</h4>
                            <p style="color: var(--neon-blue)">1,250 pts</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getBookingWizardHTML() {
        return `
            <div class="booking-wizard animate-fade-in" id="booking-wizard">
                <div class="wizard-header" style="margin-bottom: 25px; text-align: center;">
                    <h3 id="wizard-step-title" style="color: var(--neon-green); font-size: 1.5rem;">Step 1: Vehicle Details</h3>
                    <div class="progress-bar" style="height: 6px; background: rgba(255,255,255,0.1); margin-top: 15px; border-radius: 3px; overflow: hidden;">
                        <div id="wizard-progress" style="width: 33%; height: 100%; background: var(--neon-green); transition: width 0.4s ease; box-shadow: 0 0 10px var(--neon-green);"></div>
                    </div>
                </div>

                <form id="booking-form">
                    <!-- Step 1 -->
                    <div class="wizard-step active" data-step="1">
                        <div class="form-group">
                            <label><i class="fas fa-car" style="margin-right: 8px; color: var(--neon-blue);"></i> Car Make & Model</label>
                            <input type="text" id="car-model" placeholder="e.g. Honda Civic" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-id-card" style="margin-right: 8px; color: var(--neon-blue);"></i> Plate Number</label>
                            <input type="text" id="plate-number" placeholder="e.g. ABC-1234" required>
                        </div>
                        <div class="wizard-actions">
                            <button type="button" class="btn-submit" onclick="App.nextStep(2)">Next Step <i class="fas fa-arrow-right" style="margin-left: 8px;"></i></button>
                        </div>
                    </div>

                    <!-- Step 2 -->
                    <div class="wizard-step" data-step="2">
                        <div class="form-group">
                            <label><i class="fas fa-concierge-bell" style="margin-right: 8px; color: var(--neon-blue);"></i> Select Service</label>
                            <select id="service-type" required>
                                <option value="" disabled selected>Choose a package...</option>
                                <option value="basic">Basic Wash - $15</option>
                                <option value="premium">Premium Shine - $30</option>
                                <option value="ceramic">Ceramic Coating - $100</option>
                            </select>
                        </div>
                        <div class="wizard-actions dual-actions">
                            <button type="button" class="btn-back" onclick="App.nextStep(1)"><i class="fas fa-chevron-left" style="margin-right: 8px;"></i> Back</button>
                            <button type="button" class="btn-submit" onclick="App.nextStep(3)">Next Step <i class="fas fa-arrow-right" style="margin-left: 8px;"></i></button>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="wizard-step" data-step="3">
                        <div class="form-group">
                            <label><i class="fas fa-calendar-alt" style="margin-right: 8px; color: var(--neon-blue);"></i> Preferred Date & Time</label>
                            <input type="datetime-local" id="booking-time" required>
                        </div>
                        <div class="wizard-actions dual-actions">
                            <button type="button" class="btn-back" onclick="App.nextStep(2)"><i class="fas fa-chevron-left" style="margin-right: 8px;"></i> Back</button>
                            <button type="submit" class="btn-submit btn-pulse-neon"><i class="fas fa-check-circle" style="margin-right: 8px;"></i> Confirm Booking</button>
                        </div>
                    </div>
                </form>
            </div>
        `;
    },

    initWizard() {
        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Booking Confirmed! (Dummy)');
                this.loadView('home');
                this.updateActiveNav('home');
            });
        }
    },

    nextStep(step) {
        // Validation check before moving forward
        const form = document.getElementById('booking-form');
        const currentActive = document.querySelector('.wizard-step.active');
        
        // If we are moving forward, check validity of current inputs
        if (currentActive && parseInt(currentActive.dataset.step) < step) {
            const inputs = currentActive.querySelectorAll('input, select');
            let isValid = true;
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    input.reportValidity();
                    isValid = false;
                }
            });
            if (!isValid) return;
        }

        document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
        const nextStepEl = document.querySelector(`.wizard-step[data-step="${step}"]`);
        nextStepEl.classList.add('active');
        
        // Optional: Trigger reflow for animation
        nextStepEl.style.opacity = '0';
        requestAnimationFrame(() => {
            nextStepEl.style.transition = 'opacity 0.3s ease';
            nextStepEl.style.opacity = '1';
        });
        
        const titles = {
            1: 'Step 1: Vehicle Details',
            2: 'Step 2: Service Selection',
            3: 'Step 3: Schedule Time'
        };
        
        document.getElementById('wizard-step-title').textContent = titles[step];
        document.getElementById('wizard-progress').style.width = (step / 3 * 100) + '%';
    }
};

// Global reference for onclick handlers
window.App = App;

// Bootstrap
document.addEventListener('DOMContentLoaded', () => App.init());
