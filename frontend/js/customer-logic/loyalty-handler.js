/**
 * GlossFlow Loyalty & Rewards Handler
 * Manages point balances, redemption flows, and coupon application.
 */

let userPoints = 1250;
const milestones = [
    { name: 'Starter', pts: 0 },
    { name: 'Silver', pts: 500 },
    { name: 'Gold', pts: 1500 },
    { name: 'Platinum', pts: 3000 }
];

/**
 * Initialize Loyalty UI state
 */
window.initLoyalty = function() {
    updatePointsDisplay();
}

/**
 * Handle point redemption
 */
window.redeemReward = function(name, cost) {
    if (userPoints < cost) {
        showPushNotification('Insufficient Points', `You need ${cost - userPoints} more points for this.`, 'info');
        return;
    }

    userPoints -= cost;
    updatePointsDisplay();
    
    // Success feedback
    showPushNotification('Reward Redeemed!', `You successfully redeemed: ${name}. Check your coupons!`, 'success');
    
    // Haptic/Visual feedback on the button
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = 'REDEEMED!';
    btn.classList.add('pulse-gold');
    btn.disabled = true;

    setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('pulse-gold');
        btn.disabled = false;
        
        // Refresh grid states
        refreshRewardStates();
    }, 2000);
}

/**
 * Apply a coupon to the next booking
 */
window.applyCoupon = function(code) {
    showPushNotification('Coupon Applied', `Code ${code} will be applied to your next wash!`, 'success');
}

/**
 * Internal: Update point totals and milestone progress
 */
function updatePointsDisplay() {
    const pointsEl = document.getElementById('loyalty-points-total');
    if (pointsEl) {
        pointsEl.innerText = userPoints.toLocaleString();
    }

    // Update Progress Bar
    const progressFill = document.getElementById('milestone-fill');
    const milestoneLabel = document.getElementById('milestone-remaining');
    
    if (progressFill && milestoneLabel) {
        const nextMilestone = 1500; // Gold Milestone
        const percentage = Math.min((userPoints / nextMilestone) * 100, 100);
        progressFill.style.width = `${percentage}%`;
        
        const remaining = nextMilestone - userPoints;
        milestoneLabel.innerText = remaining > 0 ? `${remaining} pts to Free Wash` : 'Milestone Achieved!';
    }
}

/**
 * Internal: Refresh locked/unlocked states based on new balance
 */
function refreshRewardStates() {
    const cards = document.querySelectorAll('.reward-card');
    cards.forEach(card => {
        const costText = card.querySelector('.reward-cost')?.innerText || '0';
        const cost = parseInt(costText.replace(/[^0-9]/g, ''));
        
        if (userPoints < cost) {
            card.classList.add('locked');
            const btn = card.querySelector('.btn-redeem');
            if (btn) btn.innerText = 'Locked';
        } else {
            card.classList.remove('locked');
            const btn = card.querySelector('.btn-redeem');
            if (btn) btn.innerText = 'Redeem';
        }
    });
}
