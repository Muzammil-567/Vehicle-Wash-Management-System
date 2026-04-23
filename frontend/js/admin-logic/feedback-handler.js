/**
 * Feedback & Complaints Handler - Ticket management and Support flow
 */

function initFeedbackLogic() {
    console.log('Initializing Feedback Logic...');
    fetchAdminFeedback();
}

async function fetchAdminFeedback() {
    const container = document.getElementById('admin-feedback-list');
    const token = localStorage.getItem('token');
    if (!container || !token) return;

    try {
        const response = await fetch('http://localhost:5000/api/admin/feedback', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            if (json.data.length === 0) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-dim);">No customer reviews found.</div>';
                return;
            }

            container.innerHTML = json.data.map(review => {
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                return `
                    <div class="feedback-card animate-fade-in">
                        <div class="star-rating" style="font-size: 1.2rem; color: #ffc107;">${stars}</div>
                        <p style="color: white; font-style: italic; margin-bottom: 15px; min-height: 50px;">"${review.comment || 'No comment provided.'}"</p>
                        <div class="review-meta">
                            <div>
                                <strong style="color: var(--accent-green); display: block;">${review.customer_name}</strong>
                                <span style="font-size: 0.75rem;">Service: ${review.service_type.replace('_', ' ')}</span>
                            </div>
                            <span style="font-size: 0.7rem;">${new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("Failed to load feedback:", err);
        container.innerHTML = '<div style="color: red; text-align: center; grid-column: 1/-1;">Error connecting to server.</div>';
    }
}

// Global Export
window.initFeedbackLogic = initFeedbackLogic;
