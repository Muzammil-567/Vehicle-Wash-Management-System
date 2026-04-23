/**
 * GlossFlow Live Status Orchestrator
 * This module handles the visual transitions of the active tracking card.
 */

/**
 * Updates the CSS classes on the tracking card to reflect the current stage.
 * @param {number} stage - The stage number (1: Confirmed, 2: Received, 3: In Progress, 4: Ready)
 */
window.updateLiveStatus = function(stage) {
    console.log(`Updating Live Status to Stage: ${stage}`);
    
    // 1. Get all steps and connectors
    const steps = document.querySelectorAll('.timeline-step');
    const connectors = document.querySelectorAll('.timeline-connector');

    if (!steps.length) {
        console.warn('Tracking card elements not found. Initialization delay?');
        return;
    }

    // 2. Reset and Update Classes
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        
        // Remove existing states
        step.classList.remove('active', 'completed');
        
        if (stepNum < stage) {
            step.classList.add('completed');
        } else if (stepNum === stage) {
            step.classList.add('active');
        }
    });

    // 3. Update Connectors
    connectors.forEach((connector, index) => {
        const connectorNum = index + 1;
        
        connector.classList.remove('completed');
        
        if (connectorNum < stage) {
            connector.classList.add('completed');
        }
    });

    // 4. Update ETA/Label logic if necessary
    const etaLabel = document.querySelector('.eta-section b');
    if (etaLabel && stage === 4) {
        etaLabel.textContent = 'READY FOR PICKUP';
        etaLabel.parentElement.style.background = 'rgba(0, 255, 148, 0.1)';
        etaLabel.parentElement.style.borderColor = 'var(--neon-green)';
        etaLabel.parentElement.querySelector('i').className = 'fas fa-check-circle';
        etaLabel.parentElement.querySelector('i').style.color = 'var(--neon-green)';
    }
}

// Simple simulation for demo purposes
window.simulateWashProgress = function() {
    let currentStage = 1;
    updateLiveStatus(currentStage);

    const interval = setInterval(() => {
        currentStage++;
        if (currentStage > 4) {
            clearInterval(interval);
            console.log('Wash complete simulation finished.');
        } else {
            updateLiveStatus(currentStage);
        }
    }, 5000); // Progress every 5 seconds
}
