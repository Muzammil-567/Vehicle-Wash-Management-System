/**
 * GlossFlow Profile & Settings Handler
 * Manages profile editing, preferences toggling, and logout orchestration.
 */

window.toggleProfileEdit = function() {
    const fields = document.getElementById('account-fields');
    const editBtn = document.getElementById('btn-edit-inf');
    const isEditing = fields.classList.toggle('editing');

    const labels = fields.querySelectorAll('.val-text');
    const inputs = fields.querySelectorAll('.val-input');

    if (isEditing) {
        // Switch into Edit Mode
        labels.forEach(l => l.style.display = 'none');
        inputs.forEach(i => i.style.display = 'block');
        editBtn.innerHTML = '<i class="fas fa-check"></i>';
        editBtn.style.color = 'var(--neon-green)';
    } else {
        // Save & Switch back to Read-Only
        labels.forEach((l, index) => {
            l.textContent = inputs[index].value;
            l.style.display = 'block';
        });
        inputs.forEach(i => i.style.display = 'none');
        editBtn.innerHTML = '<i class="fas fa-pen-nib"></i>';
        editBtn.style.color = 'white';

        showPushNotification('Profile Updated', 'Your changes have been saved successfully.', 'success');
    }
}

window.handleLogout = function() {
    const modal = document.getElementById('logout-modal');
    if (modal) modal.style.display = 'flex';
}

window.hideLogoutModal = function() {
    const modal = document.getElementById('logout-modal');
    if (modal) modal.style.display = 'none';
}

window.confirmLogout = function() {
    console.log('User logging out...');
    
    // Show a final goodbye toast
    showPushNotification('Logging Out', 'Goodbye! Looking forward to your next wash.', 'info');
    
    setTimeout(() => {
        // Placeholder for redirection
        window.location.href = '../../landing-page/index.html'; 
    }, 1500);
}

window.showPasswordModal = function() {
    showPushNotification('Security', 'Password change feature coming soon to your region.', 'info');
}
