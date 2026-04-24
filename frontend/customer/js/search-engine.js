/**
 * GlossFlow Global Search Engine
 * Manages fuzzy-matching, overlay state, and discovery routing.
 */

const searchData = {
    services: [
        { name: 'Starter Wash', type: 'service', tab: 'home' },
        { name: 'Pro Wash', type: 'service', tab: 'home' },
        { name: 'Elite Detail', type: 'service', tab: 'home' },
        { name: 'Ceramic Coating', type: 'service', tab: 'home' },
        { name: 'Interior Deep Clean', type: 'service', tab: 'home' }
    ],
    vehicles: [
        { name: 'Honda Civic', plate: 'ABC-1234', type: 'vehicle', tab: 'garage' },
        { name: 'Toyota Corolla', plate: 'KJH-882', type: 'vehicle', tab: 'garage' }
    ],
    help: [
        { title: 'How to cancel?', type: 'help', tab: 'help' },
        { title: 'Refund status', type: 'help', tab: 'help' },
        { title: 'Change plate number', type: 'help', tab: 'help' }
    ]
};

/**
 * Initialize search listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Esc key listener
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('global-search-overlay');
            if (overlay && overlay.style.display === 'flex') {
                toggleSearchOverlay();
            }
        }
    });

    // Header Btn Listener
    const searchBtn = document.getElementById('btn-global-search');
    if (searchBtn) {
        searchBtn.onclick = toggleSearchOverlay;
    }
});

/**
 * Toggle Search Overlay
 */
window.toggleSearchOverlay = function() {
    const overlay = document.getElementById('global-search-overlay');
    const input = document.getElementById('global-search-input');
    
    if (overlay.style.display === 'none') {
        overlay.style.display = 'flex';
        setTimeout(() => input.focus(), 100);
    } else {
        overlay.style.display = 'none';
        input.value = '';
        performSearch(); // clear
    }
}

/**
 * Auto-fill search from trending tags
 */
window.fillSearch = function(text) {
    const input = document.getElementById('global-search-input');
    input.value = text;
    performSearch();
}

/**
 * Main Search Logic (Fuzzy Match)
 */
window.performSearch = function() {
    const query = document.getElementById('global-search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results-container');
    const suggestions = document.getElementById('search-suggestions');
    const notFound = document.getElementById('search-not-found');

    if (!query) {
        resultsContainer.style.display = 'none';
        suggestions.style.display = 'block';
        return;
    }

    suggestions.style.display = 'none';
    resultsContainer.style.display = 'block';

    const results = {
        services: searchData.services.filter(s => s.name.toLowerCase().includes(query)),
        vehicles: searchData.vehicles.filter(v => v.name.toLowerCase().includes(query) || v.plate.toLowerCase().includes(query)),
        help: searchData.help.filter(h => h.title.toLowerCase().includes(query))
    };

    let totalMatch = results.services.length + results.vehicles.length + results.help.length;

    if (totalMatch === 0) {
        notFound.style.display = 'block';
        ['services', 'vehicles', 'help'].forEach(cat => document.getElementById(`results-${cat}`).style.display = 'none');
    } else {
        notFound.style.display = 'none';
        renderCategory('services', results.services, 'concierge-bell');
        renderCategory('vehicles', results.vehicles, 'car');
        renderCategory('help', results.help, 'question-circle');
    }
}

/**
 * Helper: Render a category list
 */
function renderCategory(id, items, icon) {
    const group = document.getElementById(`results-${id}`);
    const list = group.querySelector('.results-list');
    
    if (items.length === 0) {
        group.style.display = 'none';
        return;
    }

    group.style.display = 'block';
    list.innerHTML = items.map(item => `
        <div class="result-item" onclick="navigateToResult('${item.tab}')">
            <i class="fas fa-${icon}"></i>
            <div class="result-info">
                <strong>${item.name || item.title}</strong>
                ${item.plate ? `<br><small style="opacity: 0.6;">${item.plate}</small>` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Route user to relevant tab
 */
window.navigateToResult = function(tabName) {
    toggleSearchOverlay();
    const navItem = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (navItem) navItem.click();
}
