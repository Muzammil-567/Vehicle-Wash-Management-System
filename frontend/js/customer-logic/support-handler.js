/**
 * GlossFlow Help Center & Support Handler
 * Manages FAQ interactions, search filtering, and ticket submissions.
 */

/**
 * Toggle FAQ accordion rows
 */
window.toggleFAQ = function(el) {
    // Close other open FAQs if desired (optional)
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== el) item.classList.remove('active');
    });

    el.classList.toggle('active');
}

/**
 * Filter FAQ list based on search input
 */
window.filterFAQs = function() {
    const query = document.getElementById('faq-search').value.toLowerCase();
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').innerText.toLowerCase();
        const answer = item.querySelector('.faq-answer p').innerText.toLowerCase();

        if (question.includes(query) || answer.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Handle Support Ticket Submission
 */
window.handleSupportSubmit = function(event) {
    event.preventDefault();

    const form = document.getElementById('support-ticket-form');
    const successView = document.getElementById('ticket-success-view');
    const refIdSpan = document.getElementById('ticket-ref-id');
    const btn = document.querySelector('.btn-support-send');

    // Generate random reference ID
    const refId = 'REF-' + Math.floor(1000 + Math.random() * 9000);
    refIdSpan.innerText = refId;

    // Show loading state
    const originalBtnHTML = btn.innerHTML;
    btn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    // Simulate network delay
    setTimeout(() => {
        form.style.display = 'none';
        successView.style.display = 'block';
        
        if (window.showPushNotification) {
            showPushNotification('Ticket Created', `Reference ${refId} has been submitted successfully.`, 'success');
        }

        // Scroll to top of the card for visibility
        document.getElementById('support-ticket-container').scrollIntoView({ behavior: 'smooth' });
    }, 1200);
}

/**
 * Reset form to send another ticket
 */
window.resetSupportForm = function() {
    const form = document.getElementById('support-ticket-form');
    const successView = document.getElementById('ticket-success-view');
    
    form.reset();
    form.style.display = 'block';
    successView.style.display = 'none';
    
    const btn = document.querySelector('.btn-support-send');
    btn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
    btn.disabled = false;
}
