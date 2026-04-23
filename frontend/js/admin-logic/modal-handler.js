/**
 * Modal & Interaction Handler - Logic for Modals, Bookings, and Feedback
 */

/**
 * Service/Package Modal Logic
 */
function initModalLogic() {
    const modalOverlay = document.getElementById('admin-modal-overlay');
    const addServiceBtn = document.getElementById('add-service-btn');
    const serviceForm = document.getElementById('service-form');

    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            const titleEl = document.getElementById('modal-title');
            if (titleEl) titleEl.textContent = 'Add New Service';
            if (serviceForm) serviceForm.reset();
            toggleModal(true);
        });
    }

    if (serviceForm) {
        serviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Service Data Saved!');
            toggleModal(false);
            alert('Service saved successfully!');
        });
    }

    // Modal Edit Delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit')) {
            const card = e.target.closest('.service-card');
            if (card) {
                const title = card.querySelector('h3').textContent.replace('\n', ' ');
                const price = card.querySelector('.price-tag').textContent.replace('RS. ', '');
                
                const titleEl = document.getElementById('modal-title');
                if (titleEl) titleEl.textContent = 'Edit Service';
                
                const nameInput = document.getElementById('service-name');
                const priceInput = document.getElementById('service-price');
                
                if (nameInput) nameInput.value = title;
                if (priceInput) priceInput.value = price;
                
                toggleModal(true);
            }
        }
    });
}

function toggleModal(show) {
    const modal = document.getElementById('admin-modal-overlay');
    if (modal) {
        if (show) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

/**
 * Booking Control Interactions
 */
function initBookingControl() {
    console.log('Initializing Booking Control...');
    const viewToggleBtns = document.querySelectorAll('.toggle-btn');
    const listView = document.getElementById('booking-list-view');
    const calendarView = document.getElementById('booking-calendar-view');
    
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (listView && calendarView) {
                listView.style.display = view === 'list' ? 'block' : 'none';
                calendarView.style.display = view === 'calendar' ? 'block' : 'none';
            }
        });
    });

    // Booking Action Delegation
    document.addEventListener('click', (e) => {
        const approveBtn = e.target.closest('.btn-approve');
        const cancelBtn = e.target.closest('.btn-cancel-booking');
        const resolveBtn = e.target.closest('.btn-resolve');
        
        if (approveBtn) handleBookingApproval(approveBtn);
        if (cancelBtn) handleBookingCancellation(cancelBtn);
        if (resolveBtn) handleFeedbackResolution(resolveBtn);
    });
}

function handleBookingApproval(btn) {
    const row = btn.closest('.booking-list-item');
    const actionsDiv = row.querySelector('.booking-actions');
    
    actionsDiv.innerHTML = `<div class="loading-feedback"><div class="spinner-mini"></div><span>Notifying...</span></div>`;
    
    setTimeout(() => {
        row.classList.add('approved');
        const statusPill = row.querySelector('.status-pill');
        if (statusPill) {
            statusPill.className = 'status-pill status-approved';
            statusPill.textContent = 'Approved';
        }
        actionsDiv.innerHTML = `<span class="status-pill status-approved" style="margin-right: 15px;">Approved</span>
                               <button class="action-circle-btn btn-cancel-booking"><i class="fas fa-times"></i></button>`;
    }, 1000);
}

function handleBookingCancellation(btn) {
    const row = btn.closest('.booking-list-item');
    const reason = prompt("Enter cancellation reason:");
    if (reason) {
        row.classList.add('cancelled');
        const statusPill = row.querySelector('.status-pill');
        if (statusPill) {
            statusPill.className = 'status-pill status-pending';
            statusPill.style.color = '#ff4b2b';
            statusPill.textContent = 'Cancelled';
        }
    }
}

function handleFeedbackResolution(btn) {
    if (confirm('Mark this feedback as resolved?')) {
        const ticket = btn.closest('.feedback-ticket');
        const statusPill = ticket.querySelector('.status-pill');
        statusPill.className = 'status-pill status-completed';
        statusPill.textContent = 'Resolved';
        btn.remove();
    }
}
