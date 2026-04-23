/**
 * Tab Switcher Logic - For nested tabs (Customers/Employees)
 */
function initManagementTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tableContainers = document.querySelectorAll('.admin-table-container');

    console.log('Initializing Management Tabs...');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tableContainers.forEach(c => c.classList.remove('active'));

            // Add active classes
            btn.classList.add('active');
            const targetTable = document.getElementById(targetId);
            if (targetTable) {
                targetTable.classList.add('active');
            }
        });
    });
}
