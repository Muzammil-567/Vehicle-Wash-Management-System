/**
 * Package Selection and Selection Persistence Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for pricing section injection
    setTimeout(initPackageSelection, 800);
});

function initPackageSelection() {
    const pricingButtons = document.querySelectorAll('.btn-pricing');
    const pricingCards = document.querySelectorAll('.pricing-card');

    // Restore selection from localStorage on load
    const savedPackage = localStorage.getItem('selected_car_wash_package');
    if (savedPackage) {
        applySelectionUI(savedPackage, pricingButtons, pricingCards);
    }

    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const packageType = this.getAttribute('data-package');
            
            // Save to localStorage
            localStorage.setItem('selected_car_wash_package', packageType);
            
            // Apply UI changes
            applySelectionUI(packageType, pricingButtons, pricingCards);
            
            // Optional: Smooth scroll to contact if they selected a package
            const contactSection = document.getElementById('contact-placeholder');
            if (contactSection) {
                const navHeight = 80;
                window.scrollTo({
                    top: contactSection.offsetTop - navHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Updates the UI to reflect the currently selected package
 */
function applySelectionUI(packageType, buttons, cards) {
    // Reset all cards and buttons
    cards.forEach(card => card.classList.remove('selected-card'));
    buttons.forEach(btn => {
        btn.innerHTML = 'Select Package';
        btn.classList.remove('selected-btn');
    });

    // Apply to selected
    const selectedButton = document.querySelector(`.btn-pricing[data-package="${packageType}"]`);
    const selectedCard = document.querySelector(`.pricing-card[data-package-card="${packageType}"]`);

    if (selectedButton && selectedCard) {
        selectedCard.classList.add('selected-card');
        selectedButton.innerHTML = '<i class="fas fa-check-circle"></i> Selected';
        
        // Update the Service Type dropdown in the contact form automatically
        syncContactForm(packageType);
    }
}

/**
 * Automatically updates the contact form dropdown based on selection
 */
function syncContactForm(packageType) {
    const serviceDropdown = document.getElementById('service');
    if (!serviceDropdown) return;

    switch(packageType) {
        case 'starter':
            serviceDropdown.value = 'exterior';
            break;
        case 'professional':
            serviceDropdown.value = 'interior';
            break;
        case 'elite':
            serviceDropdown.value = 'full';
            break;
    }
}
