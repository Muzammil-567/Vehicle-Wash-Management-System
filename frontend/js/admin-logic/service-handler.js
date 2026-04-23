/**
 * Service Management Handler - Logic for Service Cards, Deletion, and Advanced Editing
 */

function initServiceManagementLogic() {
    console.log('Initializing Service Management Logic...');
    const serviceSection = document.getElementById('service-management');
    if (!serviceSection) return;

    // Remove existing listener to prevent duplicates
    serviceSection.removeEventListener('click', handleServiceActions);
    serviceSection.addEventListener('click', handleServiceActions);

    // Floating Label Input Listener
    initFloatingLabels();
}

/**
 * Event Delegation for Edit/Delete on Service Cards
 */
function handleServiceActions(e) {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
        handleServiceEdit(editBtn);
    } else if (deleteBtn) {
        handleServiceDelete(deleteBtn);
    }
}

/**
 * Handle Service Deletion
 */
function handleServiceDelete(btn) {
    const card = btn.closest('.service-card');
    const serviceName = card.querySelector('h3').textContent.replace('<br>', ' ');

    // Danger Zone Confirmation
    if (confirm(`DANGER ZONE: ARE YOU SURE?\n\nThis action will permanently remove "${serviceName}". Proceed?`)) {
        
        // Deleting animation (Red pulse)
        card.classList.add('card-deleting');

        setTimeout(() => {
            card.remove();
            if (typeof showSuccessToast === 'function') {
                showSuccessToast(`${serviceName} has been removed from the system.`);
            }
        }, 1000); // Wait for animation
    }
}

/**
 * Handle Service Edit - Data Binding and Modal Population
 */
let currentEditingCard = null;

function handleServiceEdit(btn) {
    const card = btn.closest('.service-card');
    currentEditingCard = card;

    // Capture Data
    const title = card.querySelector('h3').textContent.replace('<br>', ' ');
    const price = card.querySelector('.price-tag').textContent;
    const description = card.querySelector('.card-body p').textContent;
    
    // Populate Modal Fields
    const modalTitle = document.getElementById('modal-title');
    const nameInput = document.getElementById('service-name');
    const priceInput = document.getElementById('service-price');
    const descInput = document.getElementById('service-description');
    const modalOverlay = document.getElementById('admin-modal-overlay');

    if (modalTitle) modalTitle.textContent = `Modify Service: ${title}`;
    if (nameInput) nameInput.value = title;
    if (priceInput) priceInput.value = price;
    if (descInput) descInput.value = description;

    // Refresh floating label states
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        if (input.value) {
            input.parentElement.classList.add('has-content');
        } else {
            input.parentElement.classList.remove('has-content');
        }
    });

    // Open Modal with Slide-over and Scale animation
    if (modalOverlay) {
        modalOverlay.classList.add('active', 'slide-over');
        document.body.style.overflow = 'hidden';
    }

    // Attach Submit Handler (One-time for this edit session)
    const form = document.getElementById('service-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        saveServiceChanges();
    };
}

/**
 * Save Service Changes - Instant UI Update
 */
function saveServiceChanges() {
    if (!currentEditingCard) return;

    // Get New Data from Form
    const newTitle = document.getElementById('service-name').value;
    const newPrice = document.getElementById('service-price').value;
    const newDesc = document.getElementById('service-description').value;

    // Update Card DOM
    currentEditingCard.querySelector('h3').textContent = newTitle;
    currentEditingCard.querySelector('.price-tag').textContent = newPrice;
    currentEditingCard.querySelector('.card-body p').textContent = newDesc;

    // Flash Success Pulse
    currentEditingCard.classList.add('success-pulse');
    setTimeout(() => {
        currentEditingCard.classList.remove('success-pulse');
    }, 2000);

    // Close Modal
    const modalOverlay = document.getElementById('admin-modal-overlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';

    if (typeof showSuccessToast === 'function') {
        showSuccessToast('Service updated successfully.');
    }
}

/**
 * Input Animation Helpers for Floating Labels
 */
function initFloatingLabels() {
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('has-content');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('has-content');
            }
        });
    });
}

// Global Export
window.initServiceManagementLogic = initServiceManagementLogic;
