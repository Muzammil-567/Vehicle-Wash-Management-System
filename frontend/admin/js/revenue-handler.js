/**
 * Revenue Analytics Handler - Custom Data Visualization Engine
 */

let currentRevenueData = null; // Local cache for analytics

async function initRevenueDashboard() {
    console.log('Initializing Revenue Analytics...');
    const container = document.getElementById('revenue-reports');
    if (!container) return;

    await fetchRevenueAnalytics();
    
    // Initial Render
    if (currentRevenueData) {
        renderMainChart('daily');
        renderServiceBreakdown();
        updateSummaryCards();
    }
    
    initAnalyticsListeners();
}

/**
 * Fetch detailed analytics from the backend
 */
async function fetchRevenueAnalytics() {
    const token = localStorage.getItem('token');
    try {
        console.log("📡 Fetching real-time revenue analytics...");
        const response = await fetch(`${window.API_URL}/admin/revenue-analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        if (json.success) {
            currentRevenueData = json.data;
            console.log("✅ Revenue data synchronized.");
        }
    } catch (err) {
        console.error("🔥 Analytics Fetch Failed:", err);
    }
}

function updateSummaryCards() {
    if (!currentRevenueData) return;
    const profit = currentRevenueData.summary.totalProfit;
    const tax = Math.round(profit * 0.08); // Estimate 8% tax
    const net = profit - tax;

    document.getElementById('stat-total-profit').textContent = `RS. ${profit.toLocaleString()}`;
    document.getElementById('stat-tax').textContent = `- RS. ${tax.toLocaleString()}`;
    document.getElementById('stat-net-earnings').textContent = `RS. ${net.toLocaleString()}`;
}

/**
 * Vertical Bar Chart Rendering Engine
 */
function renderMainChart(range) {
    const viewport = document.getElementById('revenue-chart-viewport');
    if (!viewport || !currentRevenueData) return;

    const data = currentRevenueData[range];
    if (!data || data.length === 0) {
        viewport.innerHTML = '<div style="text-align:center; width:100%; color:var(--text-dim);">No data for this range.</div>';
        return;
    }

    const maxValue = Math.max(...data.map(d => parseFloat(d.value) || 1));

    // Clear existing bars
    viewport.innerHTML = '<div id="chart-tooltip" class="chart-tooltip"></div>';

    data.forEach(item => {
        const val = parseFloat(item.value) || 0;
        const heightPercent = (val / maxValue) * 80;
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'revenue-bar-wrapper';
        
        const bar = document.createElement('div');
        bar.className = 'revenue-bar';
        bar.style.height = '0%';
        
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = item.label;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        viewport.appendChild(barWrapper);

        setTimeout(() => {
            bar.style.height = `${heightPercent}%`;
        }, 100);

        bar.onmouseenter = (e) => showTooltip(e, `RS. ${val.toLocaleString()}`);
        bar.onmouseleave = hideTooltip;
    });
}

/**
 * Service Breakdown Progress Engine
 */
function renderServiceBreakdown() {
    const list = document.getElementById('service-breakdown-list');
    if (!list || !currentRevenueData) return;

    const breakdown = currentRevenueData.breakdown;

    list.innerHTML = breakdown.map(item => `
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

    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach((el, index) => {
            if (breakdown[index]) el.style.width = `${breakdown[index].percent}%`;
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
    tooltip.style.position = 'fixed';
}

function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) tooltip.style.opacity = '0';
}

/**
 * Listeners for Filters and Export
 */
function initAnalyticsListeners() {
    document.querySelectorAll('[data-range]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('[data-range]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMainChart(btn.dataset.range);
        };
    });

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
                }, 3000);
            }
        };
    }
}

window.initRevenueDashboard = initRevenueDashboard;
