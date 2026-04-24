/**
 * Revenue Analytics Handler - Custom Data Visualization Engine
 */

const revenueData = {
    monthly: [
        { label: 'Jan', value: 45000 },
        { label: 'Feb', value: 52000 },
        { label: 'Mar', value: 48000 },
        { label: 'Apr', value: 61000 },
        { label: 'May', value: 55000 },
        { label: 'Jun', value: 67000 }
    ],
    weekly: [
        { label: 'W1', value: 12000 },
        { label: 'W2', value: 15000 },
        { label: 'W3', value: 11000 },
        { label: 'W4', value: 18000 }
    ],
    daily: [
        { label: 'Mon', value: 5000 },
        { label: 'Tue', value: 7200 },
        { label: 'Wed', value: 6800 },
        { label: 'Thu', value: 8500 },
        { label: 'Fri', value: 9200 },
        { label: 'Sat', value: 11000 },
        { label: 'Sun', value: 9800 }
    ],
    breakdown: [
        { name: 'Interior Detailing', percent: 45, color: 'fill-green' },
        { name: 'Exterior Wash', percent: 35, color: 'fill-blue' },
        { name: 'Ceramic Coating', percent: 20, color: 'fill-cyan' }
    ]
};

function initRevenueDashboard() {
    console.log('Initializing Revenue Analytics...');
    const container = document.getElementById('revenue-reports');
    if (!container) return;

    renderMainChart('monthly');
    renderServiceBreakdown();
    initAnalyticsListeners();
}

/**
 * Vertical Bar Chart Rendering Engine
 */
function renderMainChart(range) {
    const viewport = document.getElementById('revenue-chart-viewport');
    if (!viewport) return;

    const data = revenueData[range];
    const maxValue = Math.max(...data.map(d => d.value));

    // Clear existing bars (except tooltip)
    const tooltip = document.getElementById('chart-tooltip');
    viewport.innerHTML = '';
    viewport.appendChild(tooltip);

    data.forEach(item => {
        const heightPercent = (item.value / maxValue) * 80; // Scale to 80% container height
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'revenue-bar-wrapper';
        
        const bar = document.createElement('div');
        bar.className = 'revenue-bar';
        bar.style.height = '0%'; // Start at 0 for animation
        
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = item.label;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        viewport.appendChild(barWrapper);

        // Animate Growth
        setTimeout(() => {
            bar.style.height = `${heightPercent}%`;
        }, 100);

        // Tooltip Interaction
        bar.onmouseenter = (e) => showTooltip(e, `RS. ${item.value.toLocaleString()}`);
        bar.onmouseleave = hideTooltip;
    });
}

/**
 * Service Breakdown Progress Engine
 */
function renderServiceBreakdown() {
    const list = document.getElementById('service-breakdown-list');
    if (!list) return;

    list.innerHTML = revenueData.breakdown.map(item => `
        <div class="service-stat-item">
            <div class="item-info">
                <span>${item.name}</span>
                <span>${item.percent}%</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-fill ${item.color}" style="width: 0%"></div>
            </div>
        </div>
    `).join('');

    // Animate Progress Bars
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach((el, index) => {
            el.style.width = `${revenueData.breakdown[index].percent}%`;
        });
    }, 500);
}

/**
 * Tooltip Logic
 */
function showTooltip(e, text) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;

    tooltip.textContent = text;
    tooltip.style.opacity = '1';
    tooltip.style.left = `${e.clientX - 50}px`;
    tooltip.style.top = `${e.clientY - 40}px`;
    tooltip.style.position = 'fixed'; // Use fixed to avoid alignment issues in glass containers
}

function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) tooltip.style.opacity = '0';
}

/**
 * Listeners for Filters and Export
 */
function initAnalyticsListeners() {
    // Range Filters
    document.querySelectorAll('[data-range]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('[data-range]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMainChart(btn.dataset.range);
        };
    });

    // Export Animation
    const exportBtn = document.getElementById('generate-report-btn');
    if (exportBtn) {
        exportBtn.onclick = () => {
            const modal = document.getElementById('export-modal');
            if (modal) {
                modal.classList.add('active');
                setTimeout(() => {
                    modal.classList.remove('active');
                    if (typeof showSuccessToast === 'function') {
                        showSuccessToast('Financial Report Exported Successfully (PDF).');
                    }
                }, 3000); // Animation duration
            }
        };
    }
}

// Global Export
window.initRevenueDashboard = initRevenueDashboard;
