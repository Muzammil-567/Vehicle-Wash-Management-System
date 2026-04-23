/**
 * User Management Handler - Logic for Customer and Employee Tables
 */

/**
 * Initializes User Management logic
 * Called by admin-loader.js when the user-management component is loaded
 */
function initUserManagementLogic() {
    console.log('Initializing User Management Logic...');
    const userSection = document.getElementById('user-management');
    if (!userSection) return;

    // Remove existing listeners if any (to prevent double-firing after tab switch)
    userSection.removeEventListener('click', handleUserActions);
    userSection.addEventListener('click', handleUserActions);
}

/**
 * Event Delegation for Edit/Delete buttons
 */
function handleUserActions(e) {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
        handleUserEdit(editBtn);
    } else if (deleteBtn) {
        handleUserDelete(deleteBtn);
    }
}

/**
 * Handles User Deletion with Confirmation and Animations
 */
function handleUserDelete(btn) {
    const row = btn.closest('tr');
    const userName = row.cells[1].textContent;

    // Custom Neon Confirmation (SweetAlert Style)
    if (confirm(`ARE YOU SURE?\n\nYou are about to permanently remove "${userName}" from the system. This action cannot be undone.`)) {
        
        // UI Feedback: Red Flash Effect
        row.classList.add('row-flash-red');

        // Success Notification and Removal
        setTimeout(() => {
            row.remove();
            showSuccessToast("User record updated successfully.");
        }, 600); // Matches animation duration
    }
}

/**
 * Handles User Editing - Populates Shared Admin Modal
 */
function handleUserEdit(btn) {
    const row = btn.closest('tr');
    const isEmployee = row.closest('#employee-table') !== null;
    
    // Extract Data
    const id = row.cells[0].textContent;
    const name = row.cells[1].textContent;
    const emailOrSkill = row.cells[2].textContent;
    const phoneOrStatus = row.cells[3].textContent;

    // Update Modal Labels for User Editing
    const modalTitle = document.getElementById('modal-title');
    const nameLabel = document.querySelector('label[for="service-name"]');
    const priceLabel = document.querySelector('label[for="service-price"]');
    const categoryLabel = document.querySelector('label[for="service-category"]');
    const descLabel = document.querySelector('label[for="service-description"]');

    if (modalTitle) modalTitle.textContent = isEmployee ? 'Edit Employee Details' : 'Edit Customer Details';
    if (nameLabel) nameLabel.textContent = 'Full Name';
    if (priceLabel) priceLabel.textContent = isEmployee ? 'Skill Type' : 'Email Address';
    if (categoryLabel) categoryLabel.textContent = isEmployee ? 'Status' : 'Phone Number';
    if (descLabel) descLabel.textContent = 'Internal Notes / History';

    // Populate Fields
    const nameInput = document.getElementById('service-name');
    const priceInput = document.getElementById('service-price');
    const categorySelect = document.getElementById('service-category'); // Note: priceInput is number type in modal, converting to text if needed
    
    if (nameInput) nameInput.value = name;
    
    // Note: Since IDs in modal are service-specific, we reuse them but change type if necessary
    // However, priceInput is <input type="number">, so for emails it will fail.
    // I should probably change the type dynamically.
    if (priceInput) {
        priceInput.type = 'text';
        priceInput.value = emailOrSkill;
    }

    // Toggle Modal
    const modalOverlay = document.getElementById('admin-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Professional Neon Success Toast
 */
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'neon-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Ensure it's available globally but initialized controlled
window.initUserManagementLogic = initUserManagementLogic;
