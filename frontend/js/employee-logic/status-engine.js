/**
 * Job Status Sequence Engine
 * Handles transitions, validations, and real-time feedback for car wash tasks.
 */

const StatusEngine = {
    // Valid status sequence
    SEQUENCE: ['pending', 'in_progress', 'completed'],

    /**
     * Attempts to transition a task to a new status
     */
    async transition(taskId, nextStatus) {
        const card = document.getElementById(`task-${taskId}`);
        if (!card) return;

        const currentStatus = card.dataset.status;
        const token = localStorage.getItem('token');
        
        // 1. Validation Logic
        if (!this.isValidTransition(currentStatus, nextStatus)) {
            this.showToast('error', 'Error: Please start the job first.');
            return;
        }

        try {
            // 2. Backend Synchronization
            const response = await fetch(`http://localhost:5000/api/employee/tasks/${taskId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });

            const data = await response.json();

            if (data.success) {
                // 3. Apply Update
                this.applyStatusUpdate(taskId, nextStatus);

                // 4. Notifications
                this.triggerNotification(nextStatus);
                
                // Refresh list if completed to move to history
                if (nextStatus === 'completed' && typeof fetchRealTasks === 'function') {
                    setTimeout(() => fetchRealTasks(), 1500);
                }
            } else {
                this.showToast('error', data.message || 'Failed to update status.');
            }
        } catch (err) {
            console.error("Status update error:", err);
            this.showToast('error', 'Server connection error.');
        }
    },

    /**
     * Validates if the transition is allowed (Pending -> In Progress -> Completed)
     */
    isValidTransition(current, next) {
        if (current === 'pending' && next === 'completed') return false;
        if (current === 'completed') return false; // Already done
        return true;
    },

    /**
     * Simulates backend synchronization with Admin panel
     */
    async simulateAdminSync(taskId) {
        const card = document.getElementById(`task-${taskId}`);
        const syncIndicator = document.createElement('div');
        syncIndicator.className = 'sync-indicator';
        syncIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Syncing...';
        
        card.appendChild(syncIndicator);
        
        // Appear for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        syncIndicator.classList.add('fade-out');
        setTimeout(() => syncIndicator.remove(), 300);
    },

    /**
     * Updates UI components for the status change
     */
    applyStatusUpdate(taskId, newStatus) {
        const card = document.getElementById(`task-${taskId}`);
        if (!card) return;

        // Update card attributes
        card.dataset.status = newStatus;
        card.classList.remove('pending', 'in_progress', 'completed');
        card.classList.add(newStatus);

        // Update Progress Bar
        const progressBar = card.querySelector('.progress-bar');
        if (progressBar) {
            const progress = newStatus === 'pending' ? '0%' : (newStatus === 'in_progress' ? '50%' : '100%');
            progressBar.style.width = progress;
        }

        // Haptic-like feedback
        card.style.transform = 'scale(0.98)';
        setTimeout(() => card.style.transform = 'scale(1)', 150);

        // Special handling for completion
        if (newStatus === 'completed') {
            setTimeout(() => {
                this.moveToRecentlyFinished(card);
            }, 800);
        }
    },

    /**
     * Moves completed cards to the bottom section
     */
    moveToRecentlyFinished(card) {
        let finishedSection = document.getElementById('recently-finished-section');
        
        if (!finishedSection) {
            finishedSection = document.createElement('div');
            finishedSection.id = 'recently-finished-section';
            finishedSection.innerHTML = '<h3 class="finished-title">Recently Finished</h3><div class="finished-container"></div>';
            document.getElementById('active-tasks-container').after(finishedSection);
        }

        const container = finishedSection.querySelector('.finished-container');
        card.classList.add('finished-animation');
        
        setTimeout(() => {
            container.appendChild(card);
            card.classList.remove('finished-animation');
        }, 300);
    },

    /**
     * Triggers Toasts based on status
     */
    triggerNotification(status) {
        if (status === 'in_progress') {
            this.showToast('info', 'Job Started: Time tracker active.');
        } else if (status === 'completed') {
            this.showToast('success', 'Job Completed: Notification sent to Admin & Customer.');
        }
    },

    /**
     * Toast UI Implementation
     */
    showToast(type, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : (type === 'success' ? 'fa-check-circle' : 'fa-info-circle')}"></i>
                <span>${message}</span>
            </div>
        `;

        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
};

// Global accessor for HTML onclick events
window.updateJobStatus = (taskId, nextStatus) => StatusEngine.transition(taskId, nextStatus);
