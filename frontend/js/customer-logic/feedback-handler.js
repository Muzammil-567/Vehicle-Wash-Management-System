/**
 * GlossFlow Feedback & Rating Handler
 * Manages the interactive star-rating modal and submission workflow.
 */

let currentRating = 0;
const feedbackLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

/**
 * Initialize star rating listeners
 */
function initStarRating() {
    const stars = document.querySelectorAll('.feedback-star');
    const label = document.getElementById('rating-text');

    stars.forEach(star => {
        // Hover effect: light up stars up to index
        star.addEventListener('mouseenter', () => {
            const index = parseInt(star.dataset.index);
            highlightStars(index);
            if (label) label.innerText = feedbackLabels[index - 1];
        });

        // Click effect: lock in rating
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.index);
            highlightStars(currentRating);
            if (label) label.innerText = feedbackLabels[currentRating - 1];
        });
    });

    // Reset to current rating on mouse leave
    const starsRow = document.getElementById('stars-row');
    if (starsRow) {
        starsRow.addEventListener('mouseleave', () => {
            highlightStars(currentRating);
            if (label) label.innerText = currentRating > 0 ? feedbackLabels[currentRating - 1] : "Tap to Rate";
        });
    }
}

/**
 * Helper: Paint stars up to n
 */
function highlightStars(count) {
    const stars = document.querySelectorAll('.feedback-star');
    stars.forEach(star => {
        const idx = parseInt(star.dataset.index);
        if (idx <= count) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

/**
 * Toggle category chips
 */
window.toggleFeedbackChip = function(el) {
    el.classList.toggle('selected');
}

/**
 * Show the modal globally
 */
window.showFeedbackModal = function() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.style.display = 'flex';
        initStarRating();
    }
}

/**
 * Close the modal
 */
window.closeFeedbackModal = function() {
    const modal = document.getElementById('feedback-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * Submit feedback with mock animation
 */
window.submitFeedback = function() {
    if (currentRating === 0) {
        showPushNotification('Please Rate', 'Select a star rating before submitting.', 'info');
        return;
    }

    const formView = document.getElementById('feedback-form-view');
    const successView = document.getElementById('feedback-success-view');

    // Show processing state on button
    const btn = document.querySelector('.btn-submit-feedback');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    setTimeout(() => {
        // Transition to success
        formView.style.display = 'none';
        successView.style.display = 'block';

        // Notify user about bonus points (mock)
        if (window.showPushNotification) {
            showPushNotification('Points Earned!', '+50 Loyalty points added for your feedback.', 'success');
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
            closeFeedbackModal();
            // Reset for next time
            setTimeout(() => {
                formView.style.display = 'block';
                successView.style.display = 'none';
                currentRating = 0;
            }, 500);
        }, 3500);
    }, 1500);
}
