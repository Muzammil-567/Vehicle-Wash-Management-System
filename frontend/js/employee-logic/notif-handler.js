/**
 * Notification & Issue Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    initNotifDrawer();
});

/**
 * Shows the sliding notification banner
 */
window.showNotifBanner = function() {
    const banner = document.getElementById('notif-banner');
    if (!banner) return;

    banner.classList.add('active');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        banner.classList.remove('active');
    }, 5000);
};

/**
 * Handle Notification Drawer Visibility
 */
function initNotifDrawer() {
    const bell = document.querySelector('.notification-bell');
    const drawer = document.getElementById('notif-drawer');
    const closeBtn = document.getElementById('close-drawer');

    if (bell && drawer) {
        bell.addEventListener('click', () => {
            drawer.classList.add('open');
            // Reset badge
            const badge = bell.querySelector('.notification-badge');
            if (badge) badge.style.display = 'none';
        });
    }

    if (closeBtn && drawer) {
        closeBtn.addEventListener('click', () => {
            drawer.classList.remove('open');
        });
    }
}

/**
 * Issue Modal Logic
 */
window.openIssueModal = function(taskId) {
    const modal = document.getElementById('issue-modal-overlay');
    const taskIdInput = document.getElementById('report-task-id');
    
    if (modal && taskIdInput) {
        taskIdInput.value = taskId;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeIssueModal = function() {
    const modal = document.getElementById('issue-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

/**
 * Handle Issue Form Submission
 */
window.handleIssueSubmit = function(event) {
    event.preventDefault();
    const taskId = document.getElementById('report-task-id').value;
    const type = document.getElementById('issue-type').value;
    const desc = document.getElementById('issue-description').value;

    console.log(`Reporting issue for Task ${taskId}: ${type} - ${desc}`);

    // Simulation of sync
    const submitBtn = event.target.querySelector('.btn-report');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
        closeIssueModal();
        if (window.StatusEngine && window.StatusEngine.showToast) {
            window.StatusEngine.showToast('success', 'Report Sent to Admin. Safety first!');
        }
        
        // Reset form
        event.target.reset();
        submitBtn.innerHTML = 'Submit Report';
        submitBtn.disabled = false;
    }, 1500);
};

/**
 * Mock Notification Trigger (for verification)
 */
setTimeout(() => {
    // Simulate a new job notification after 10 seconds
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.style.display = 'block';
        badge.textContent = '1';
    }
    showNotifBanner();
}, 10000);
