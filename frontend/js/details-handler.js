/**
 * Details Page Dynamic Content Handler
 */
const serviceData = {
    'exterior': {
        title: 'Hydro-Dynamic Exterior',
        price: 'PKR 1,500',
        description: 'Establish the ultimate barrier for your vehicle with our hydro-dynamic decontamination process. We focus on surface purity and long-lasting protection.',
        image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?auto=format&fit=crop&q=80&w=800',
        included: [
            { title: 'High-Pressure Pre-Soak', text: 'Safe removal of abrasive surface dirt using snow foam.' },
            { title: 'Iron Decontamination', text: 'Chemical removal of embedded metallic particles.' },
            { title: 'Nano-Wax Protection', text: 'Application of high-grade sealant for extreme water beading.' },
            { title: 'Wheel Arch Detailing', text: 'Deep cleaning and dressing of under-chassis visible areas.' }
        ],
        timeline: [
            { step: 'Evaluation', text: 'Visual audit of paint condition and surface contaminants.' },
            { step: 'Snow Foam Application', text: 'Encapsulating dirt for a scratch-free contact wash.' },
            { step: 'Polymer Sealant', text: 'Thermal-bonded layer for UV and rain protection.' }
        ]
    },
    'interior': {
        title: 'Precision Interior Detailing',
        price: 'PKR 3,500',
        description: 'Step into a medical-grade sanitized environment. Our precision interior service removes 99% of bacteria and restores natural cabin textures.',
        image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800',
        included: [
            { title: 'Steam Sanitization', text: '200°C steam to kill bacteria in vents and fabric fibers.' },
            { title: 'Leather Conditioning', text: 'pH-neutral feeding to prevent cracking and fading.' },
            { title: 'Deep Extraction', text: 'Industrial vacuuming and stain removal from carpets.' },
            { title: 'Anti-Static Coating', text: 'Dust-repellent layer for all dashboard surfaces.' }
        ],
        timeline: [
            { step: 'Cabin Clearing', text: 'Removal of all loose items and heavy debris.' },
            { step: 'Steam Extraction', text: 'Deep cleaning of seats, mats, and roof lining.' },
            { step: 'Odor Elimination', text: 'Neutralizing molecular scents for a fresh aroma.' }
        ]
    },
    'ceramic': {
        title: 'Full Ceramic Shield',
        price: 'PKR 12,000',
        description: 'The pinnacle of automotive protection. Our 9H Ceramic Shield creates a semi-permanent bond that shields your paint for up to 2 years.',
        image: 'https://images.unsplash.com/photo-1552933061-90322eecd139?auto=format&fit=crop&q=80&w=800',
        included: [
            { title: '9H Hardness Layer', text: 'Glass-like protection against micro-scratches.' },
            { title: 'Paint Correction', text: 'Single-stage machine polish to remove swirl marks.' },
            { title: 'Hydrophobic Finish', text: 'Extreme water and mud repellency for easy cleaning.' },
            { title: 'Alloy Face Coating', text: 'Preventing brake dust burn-in on expensive rims.' }
        ],
        timeline: [
            { step: 'Clay Bar Treatment', text: 'Ensuring a chemically pure surface for bonding.' },
            { step: 'Polishing', text: 'Refining the clear coat to a mirror-like finish.' },
            { step: 'Layer Application', text: 'Precision cross-hatch application of the ceramic liquid.' }
        ]
    }
};

function initDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('service') || 'exterior';
    const data = serviceData[type];

    if (!data) return;

    // Update Basic Info
    document.title = `${data.title} | GlossFlow`;
    
    // Ensure elements exist before updating
    const titleEl = document.getElementById('detail-title');
    const priceEl = document.getElementById('detail-price');
    const descEl = document.getElementById('detail-description');
    const imgEl = document.getElementById('detail-image');

    if (titleEl) titleEl.textContent = data.title;
    if (priceEl) priceEl.textContent = data.price;
    if (descEl) descEl.textContent = data.description;
    if (imgEl) imgEl.src = data.image;

    // Update What's Included
    const grid = document.getElementById('included-grid');
    if (grid) {
        grid.innerHTML = data.included.map(item => `
            <div class="included-item">
                <i class="fas fa-check-circle"></i>
                <div>
                    <h4>${item.title}</h4>
                    <p>${item.text}</p>
                </div>
            </div>
        `).join('');
    }

    // Update Process Timeline
    const timeline = document.getElementById('timeline-container');
    if (timeline) {
        timeline.innerHTML = data.timeline.map((step, index) => `
            <div class="timeline-step">
                <span class="step-number">STEP 0${index + 1}</span>
                <h4>${step.step}</h4>
                <p>${step.text}</p>
            </div>
        `).join('');
    }

    // Handle Selection Confirmation Logic
    const confirmBtn = document.querySelector('.btn-primary');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const mapping = {
                'exterior': 'starter',
                'interior': 'professional',
                'ceramic': 'elite'
            };
            const packageType = mapping[type] || 'starter';
            localStorage.setItem('selected_car_wash_package', packageType);
            window.location.href = `index.html#contact-placeholder`;
        });
    }

    // Re-trigger scroll animations after a short delay
    setTimeout(() => {
        if (typeof initScrollAnimations === 'function') {
            initScrollAnimations();
        }
    }, 500);
}

// Run as soon as DOM is ready, and retry if items aren't found
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailsPage);
} else {
    initDetailsPage();
}

// Fallback for async injection scenarios
setTimeout(initDetailsPage, 1000);
