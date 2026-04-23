/**
 * Feedback & Complaints Handler - Ticket management and Support flow
 */

function initFeedbackLogic() {
    console.log('Initializing Feedback & Support Logic...');
    const container = document.getElementById('reports-feedback');
    if (!container) return;

    initFeedbackFilters();
    initResolveActions();
}

/**
 * Filter Feedback Tickets
 */
function initFeedbackFilters() {
    const filters = document.querySelectorAll('[data-feedback-filter]');
    const tickets = document.querySelectorAll('.feedback-ticket');

    filters.forEach(btn => {
        btn.onclick = () => {
            // Toggle Active
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.feedbackFilter;
            
            tickets.forEach(ticket => {
                if (filter === 'all') {
                    ticket.style.display = 'grid';
                } else if (filter === 'high') {
                    // Logic for high priority (e.g., 3 stars or less)
                    const stars = ticket.querySelectorAll('.fa-star').length;
                    ticket.style.display = (stars <= 3) ? 'grid' : 'none';
                } else if (filter === 'pending') {
                    const status = ticket.querySelector('.status-pill').textContent.toLowerCase();
                    ticket.style.display = (status === 'pending') ? 'grid' : 'none';
                }
            });
        };
    });
}

/**
 * Resolve Ticket Logic
 */
function initResolveActions() {
    document.addEventListener('click', (e) => {
        const resolveBtn = e.target.closest('.btn-resolve');
        if (resolveBtn) {
            const ticket = resolveBtn.closest('.feedback-ticket');
            const statusPill = ticket.querySelector('.status-pill');

            // Visual feedback
            resolveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            setTimeout(() => {
                statusPill.textContent = 'Resolved';
                statusPill.className = 'status-pill status-completed';
                resolveBtn.remove(); // Remove resolve button after success
                
                if (typeof showSuccessToast === 'function') {
                    showSuccessToast('Ticket marked as Resolved.');
                }
            }, 800);
        }
    });
}

// Global Export
window.initFeedbackLogic = initFeedbackLogic;
