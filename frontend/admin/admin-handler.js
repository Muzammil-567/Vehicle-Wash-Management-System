/**
 * Admin Dashboard Interactivity Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initNavLinkActivation();
    initManagementTabs();
    initModalLogic();
    initBookingControl();
});

/**
 * Handles mobile sidebar toggle (Hamburger Menu)
 */
function initSidebarToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            
            // Toggle icon between bars and times
            const icon = menuToggle.querySelector('i');
            if (sidebar.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
}

/**
 * Handles sidebar link activation and page title updates
 */
function initNavLinkActivation() {
    const links = document.querySelectorAll('.sidebar-link');
    const pageTitle = document.getElementById('page-title');
    const sections = {
        'Dashboard Overview': ['welcome-banner', 'stats-overview'],
        'User Management': ['users-section'],
        'Service Management': ['services-section'],
        'Booking Control': ['booking-control'],
        'Revenue Reports': ['revenue-reports'],
        'Feedback & Complaints': ['feedback-handling']
    };

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const title = this.querySelector('span').textContent;
            
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
            }

            if (title === 'Logout') return;

            // Remove active class from all
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Update Header Title
            if (pageTitle) {
                pageTitle.textContent = title;
            }

            // Section Switching Logic
            const allSectionElements = [
                'welcome-banner', 
                'stats-overview', 
                'users-section', 
                'services-section', 
                'booking-control',
                'revenue-reports',
                'feedback-handling'
            ];
            
            // Hide all first
            allSectionElements.forEach(id => {
                const el = document.getElementById(id) || document.querySelector(`.${id}`);
                if (el) el.style.display = 'none';
            });

            // Show active section elements
            if (sections[title]) {
                sections[title].forEach(id => {
                    const el = document.getElementById(id) || document.querySelector(`.${id}`);
                    if (el) {
                        el.style.display = id.includes('grid') || id.includes('stats') ? 'grid' : 'block';
                    }
                });
            }

            console.log(`Navigating to: ${title}`);
        });
    });
}

/**
 * Handles Tab Switching for User Management (Customers vs Employees)
 */
function initManagementTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tableContainers = document.querySelectorAll('.admin-table-container');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tableContainers.forEach(c => c.classList.remove('active'));

            // Add active classes
            btn.classList.add('active');
            const targetTable = document.getElementById(targetId);
            if (targetTable) {
                targetTable.classList.add('active');
            }
        });
    });
}

/**
 * Handles Service Management Modal (Show/Hide)
 */
function initModalLogic() {
    const modalOverlay = document.getElementById('admin-modal-overlay');
    const addServiceBtn = document.getElementById('add-service-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const serviceForm = document.getElementById('service-form');

    const toggleModal = (show) => {
        if (show) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        } else {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            document.getElementById('modal-title').textContent = 'Add New Service';
            serviceForm.reset();
            toggleModal(true);
        });
    }

    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => toggleModal(false));
        }
    });

    // Close on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) toggleModal(false);
        });
    }

    // Form submission (Prototype)
    if (serviceForm) {
        serviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Service Data Saved:', {
                name: document.getElementById('service-name').value,
                price: document.getElementById('service-price').value,
                category: document.getElementById('service-category').value
            });
            toggleModal(false);
            alert('Service saved successfully!');
        });
    }

    // Quick Edit logic (Delegation)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit')) {
            const card = e.target.closest('.service-card');
            if (card) {
                const title = card.querySelector('h3').textContent.replace('\n', ' ');
                const price = card.querySelector('.price-tag').textContent.replace('RS. ', '');
                
                document.getElementById('modal-title').textContent = 'Edit Service';
                document.getElementById('service-name').value = title;
                document.getElementById('service-price').value = price;
                
                toggleModal(true);
            }
        }
    });
}

/**
 * Handles Booking Control Center Interactions
 */
function initBookingControl() {
    const viewToggleBtns = document.querySelectorAll('.toggle-btn');
    const listView = document.getElementById('booking-list-view');
    const calendarView = document.getElementById('booking-calendar-view');
    
    // View Toggling (List vs Calendar)
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (view === 'list') {
                listView.style.display = 'block';
                calendarView.style.display = 'none';
            } else {
                listView.style.display = 'none';
                calendarView.style.display = 'block';
            }
        });
    });

    // Approval / Cancellation Logic (Delegation)
    document.addEventListener('click', (e) => {
        const approveBtn = e.target.closest('.btn-approve');
        const cancelBtn = e.target.closest('.btn-cancel-booking');
        
        if (approveBtn) {
            handleBookingApproval(approveBtn);
        } else if (cancelBtn) {
            handleBookingCancellation(cancelBtn);
        }
    });
}

/**
 * Simulated Approval Flow
 */
function handleBookingApproval(btn) {
    const row = btn.closest('.booking-list-item');
    const actionsDiv = row.querySelector('.booking-actions');
    const originalContent = actionsDiv.innerHTML;
    
    // Show Loading Feedback
    actionsDiv.innerHTML = `
        <div class="loading-feedback">
            <div class="spinner-mini"></div>
            <span>Notifying Customer...</span>
        </div>
    `;
    
    setTimeout(() => {
        row.classList.add('approved');
        row.classList.remove('cancelled');
        
        // Update Status Badge
        const statusPill = row.querySelector('.status-pill');
        if (statusPill) {
            statusPill.className = 'status-pill status-approved';
            statusPill.textContent = 'Approved';
        }
        
        // Restore actions (simplified)
        actionsDiv.innerHTML = `
             <span class="status-pill status-approved" style="margin-right: 15px;">Approved</span>
             <button class="action-circle-btn btn-cancel-booking" title="Cancel Booking"><i class="fas fa-times"></i></button>
        `;
    }, 1500);
}

/**
 * Simulated Cancellation Flow
 */
function handleBookingCancellation(btn) {
    const row = btn.closest('.booking-list-item');
    const reason = prompt("Enter cancellation reason:");
    
    if (reason !== null) {
        row.classList.add('cancelled');
        row.classList.remove('approved');
        
        const statusPill = row.querySelector('.status-pill');
        if (statusPill) {
            statusPill.className = 'status-pill status-pending';
            statusPill.style.background = 'rgba(255, 75, 43, 0.1)';
            statusPill.style.color = '#ff4b2b';
            statusPill.textContent = 'Cancelled';
        }
        
        alert(`Booking cancelled. Reason: ${reason}`);
    }
}

/**
 * Handles Feedback Resolution Logic
 */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-resolve')) {
        const ticket = e.target.closest('.feedback-ticket');
        const statusPill = ticket.querySelector('.status-pill');
        const actionsDiv = e.target.closest('.ticket-actions');
        
        if (confirm('Mark this feedback as resolved?')) {
            statusPill.className = 'status-pill status-completed';
            statusPill.textContent = 'Resolved';
            
            // Remove the resolve button
            e.target.remove();
            
            // Replace with a 'View' button if it's the only one
            if (actionsDiv.children.length === 1) { // Only 'Reply' left
                 // No action needed for prototype
            }
            
            alert('Ticket marked as resolved.');
        }
    }
});
