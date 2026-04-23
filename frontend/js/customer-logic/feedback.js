/**
 * Feedback & Rating System Logic
 */

let selectedRating = 0;

window.openFeedbackModal = function(bookingId) {
    document.getElementById('feedback-booking-id').value = bookingId;
    document.getElementById('feedback-modal').style.display = 'flex';
    resetStars();
};

window.closeFeedbackModal = function() {
    document.getElementById('feedback-modal').style.display = 'none';
    selectedRating = 0;
};

function resetStars() {
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach(s => {
        s.style.color = 'rgba(255,255,255,0.1)';
        s.style.textShadow = 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach(star => {
        star.addEventListener('mouseover', () => highlightStars(star.dataset.rating));
        star.addEventListener('mouseout', () => highlightStars(selectedRating));
        star.addEventListener('click', () => {
            selectedRating = star.dataset.rating;
            highlightStars(selectedRating);
        });
    });
});

function highlightStars(rating) {
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach(s => {
        if (s.dataset.rating <= rating) {
            s.style.color = 'var(--neon-green)';
            s.style.textShadow = '0 0 10px rgba(0,255,148,0.5)';
        } else {
            s.style.color = 'rgba(255,255,255,0.1)';
            s.style.textShadow = 'none';
        }
    });
}

window.submitFeedback = async function() {
    const booking_id = document.getElementById('feedback-booking-id').value;
    const comment = document.getElementById('feedback-comment').value;
    const token = localStorage.getItem('token');

    if (selectedRating === 0) {
        alert("Please select a star rating.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/customer/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                booking_id,
                rating: selectedRating,
                comment
            })
        });

        const data = await response.json();
        if (data.success) {
            alert("Thank you! Your feedback has been submitted.");
            closeFeedbackModal();
            // Refresh bookings to hide the button
            if (typeof fetchMyBookings === 'function') fetchMyBookings();
        } else {
            alert(data.message || "Failed to submit feedback.");
        }
    } catch (err) {
        console.error("Feedback error:", err);
        alert("An error occurred. Please try again.");
    }
};
