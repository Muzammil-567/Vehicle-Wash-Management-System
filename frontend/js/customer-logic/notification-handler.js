/**
 * GlossFlow Notification & Alert Handler
 * Manages the real-time toast engine and the notification inbox drawer.
 */

const mockNotifications = [
    { id: 1, type: 'success', msg: 'Your Honda Civic is now being washed! 🧼', time: '2 mins ago', unread: true },
    { id: 2, type: 'info', msg: 'Booking confirmed for tomorrow @ 10 AM.', time: '1 hour ago', unread: true },
    { id: 3, type: 'promo', msg: 'Flash Sale! 20% off on Elite Detailing this weekend.', time: '5 hours ago', unread: false }
];

/**
 * Toggle the Notification Drawer
 */
window.toggleNotifDrawer = function() {
    const drawer = document.getElementById('notif-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    if (drawer && overlay) {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (drawer.classList.contains('active')) {
            renderNotifications();
        }
    }
}

/**
 * Mark a single notification as read
 */
window.markNotifRead = function(element) {
    if (element.classList.contains('unread')) {
        element.classList.remove('unread');
        const dot = element.querySelector('.unread-dot');
        if (dot) dot.remove();
        updateBellBadge();
    }
}

/**
 * Mark all as read
 */
window.markAllNotifsRead = function() {
    const unreadItems = document.querySelectorAll('.notif-item.unread');
    unreadItems.forEach(item => markNotifRead(item));
    updateBellBadge();
}

/**
 * Show a push-style toast notification
 */
window.showPushNotification = function(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-alert type-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'promo' ? 'fa-gift' : 'fa-info-circle');
    
    toast.innerHTML = `
        <i class="fas ${icon}" style="color: ${type === 'success' ? 'var(--neon-green)' : 'var(--neon-blue)'}"></i>
        <div class="toast-content">
            <strong style="display: block; font-size: 0.8rem;">${title}</strong>
            <span style="font-size: 0.75rem; opacity: 0.8;">${message}</span>
        </div>
    `;

    container.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => {
        toast.classList.add('closing');
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

/**
 * Update the unread badge on the bell icon
 */
function updateBellBadge() {
    const unreadCount = document.querySelectorAll('.notif-item.unread').length;
    const bellBadge = document.querySelector('.notif-dot');
    if (bellBadge) {
        bellBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

/**
 * Internal: Render notifications in the drawer
 */
function renderNotifications() {
    const list = document.getElementById('notif-list');
    const emptyState = document.getElementById('notif-empty-state');
    
    if (!list || !emptyState) return;

    // Check if everything is red
    const items = list.querySelectorAll('.notif-item');
    if (items.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'flex';
    } else {
        list.style.display = 'block';
        emptyState.style.display = 'none';
    }
}

// Initial badge check
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateBellBadge, 1000); // Wait for header to load
});
