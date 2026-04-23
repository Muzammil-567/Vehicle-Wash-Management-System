/**
 * GlossFlow Garage Handler
 * Manages vehicle selection and interaction logic.
 */

/**
 * Handles the selection of a vehicle card.
 * @param {HTMLElement} element - The vehicle card element clicked.
 */
window.selectVehicle = function(element) {
    console.log('Vehicle selected:', element.querySelector('.nickname')?.textContent);

    // 1. Remove selection from all other cards in the grid
    const allCards = document.querySelectorAll('.vehicle-card');
    allCards.forEach(card => card.classList.remove('selected'));

    // 2. Add selection to the clicked element
    element.classList.add('selected');

    // 3. Optional: Trigger a notification or update backend state
    showSelectionToast(element.querySelector('.nickname')?.textContent);
}

/**
 * Simple feedback toast for selection
 */
function showSelectionToast(name) {
    // This could be a more complex UI component
    console.log(`Now viewing: ${name}`);
}

/**
 * Initialize garage-specific listeners if needed
 */
document.addEventListener('DOMContentLoaded', () => {
    // Logic that runs once when the page loads, 
    // but the garage component is loaded dynamically,
    // so we might need an observer or event-based initialization.
});
