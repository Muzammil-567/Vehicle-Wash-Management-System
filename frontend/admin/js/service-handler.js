/**
 * Service Management Handler - Logic for Service Cards, Deletion, and Advanced Editing
 */

function initServiceManagementLogic() {
    console.log('Initializing Service Management Logic...');
    fetchServices();
    initServiceSearch();
}

function initServiceSearch() {
    const searchInput = document.getElementById('service-search');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.service-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'block' : 'none';
            });
        };
    }
}

async function fetchServices() {
    const container = document.getElementById('service-grid');
    const token = localStorage.getItem('token');
    if (!container || !token) return;

    try {
        const response = await fetch(`${window.API_URL}/admin/services/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            renderServices(json.data);
        }
    } catch (err) {
        console.error("Fetch services error:", err);
    }
}

function renderServices(services) {
    const container = document.getElementById('service-grid');
    if (!container) return;

    container.innerHTML = services.map(service => {
        let features = [];
        try { features = JSON.parse(service.features || '[]'); } catch(e) {}
        
        return `
            <div class="service-card animate-fade-in ${service.is_active ? '' : 'inactive-card'}" data-id="${service.id}">
                <div class="card-header">
                    <div class="status-toggle">
                        <label class="switch">
                            <input type="checkbox" ${service.is_active ? 'checked' : ''} onchange="toggleServiceStatus(${service.id}, this.checked)">
                            <span class="slider round"></span>
                        </label>
                        <span class="status-label">${service.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="action-btns">
                        <button class="action-btn btn-edit" onclick="openEditServiceModal(${service.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteService(${service.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <h3>${service.service_name}</h3>
                    <p>${service.description}</p>
                    <div class="service-features">
                        ${features.map(f => `<span class="feature-tag"><i class="fas fa-check"></i> ${f}</span>`).join('')}
                    </div>
                </div>
                <div class="card-footer">
                    <div class="price-box">
                        <span class="currency">RS.</span>
                        <span class="price-tag">${service.price}</span>
                    </div>
                    <span class="category-badge">${service.category}</span>
                </div>
            </div>
        `;
    }).join('');
}

window.toggleServiceStatus = async function(id, isActive) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${window.API_URL}/admin/services/${id}/toggle`, { 
            method: "PATCH", 
            headers: { "Authorization": `Bearer ${token}` } 
        });
        
        if (response.ok) {
            fetchServices();
            window.showSuccessToast('Service status updated.');
        }
    } catch (err) {
        console.error("Toggle error:", err);
    }
};

window.openAddServiceModal = function() {
    window.currentEditingServiceId = null;
    
    // Reset Form
    const form = document.getElementById('service-form');
    if (form) form.reset();

    // UI Updates for "Add" mode
    document.getElementById('modal-title').textContent = 'Add New Wash Service';
    const submitBtn = document.getElementById('update-user-btn');
    if (submitBtn) submitBtn.textContent = 'Create Service';

    // Ensure fields are visible
    const descGroup = document.getElementById('group-service-description');
    const previewGroup = document.getElementById('image-preview-container');
    if (descGroup) descGroup.style.display = 'block';
    if (previewGroup) previewGroup.style.display = 'flex';

    const modal = document.getElementById('admin-modal-overlay');
    if (modal) modal.classList.add('active');

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await saveServiceChanges(true); // true means it's a new service
        };
    }
};

window.openEditServiceModal = async function(id) {
    const card = document.querySelector(`.service-card[data-id="${id}"]`);
    if (!card) return;

    window.currentEditingServiceId = id;
    
    // UI Updates for "Edit" mode
    document.getElementById('modal-title').textContent = 'Edit Wash Service';
    const submitBtn = document.getElementById('update-user-btn');
    if (submitBtn) submitBtn.textContent = 'Save Changes';

    document.getElementById('service-name').value = card.querySelector('h3').textContent;
    document.getElementById('service-price').value = card.querySelector('.price-tag').textContent;
    document.getElementById('service-description').value = card.querySelector('p').textContent;
    
    const featInput = document.getElementById('service-features');
    if (featInput) {
        featInput.value = Array.from(card.querySelectorAll('.feature-tag')).map(t => t.textContent.trim()).join(', ');
    }
    
    const modal = document.getElementById('admin-modal-overlay');
    if (modal) modal.classList.add('active');
    
    const form = document.getElementById('service-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await saveServiceChanges(false); // false means it's an update
        };
    }
};

async function saveServiceChanges(isNew = false) {
    const token = localStorage.getItem('token');
    const id = window.currentEditingServiceId;
    
    const featValue = document.getElementById('service-features')?.value || '';
    const data = {
        service_name: document.getElementById('service-name').value,
        price: document.getElementById('service-price').value,
        description: document.getElementById('service-description').value,
        category: document.getElementById('service-category').value,
        features: featValue.split(',').map(f => f.trim()).filter(f => f !== ''),
        is_active: 1
    };

    const url = isNew ? `${window.API_URL}/admin/services` : `${window.API_URL}/admin/services/${id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok || result.success) {
            const modal = document.getElementById('admin-modal-overlay');
            if (modal) modal.classList.remove('active');
            fetchServices();
            window.showSuccessToast(isNew ? 'Service created successfully!' : 'Service updated successfully.');
        } else {
            alert("Error: " + (result.message || 'Operation failed'));
        }
    } catch (err) {
        console.error("Save error:", err);
        alert("Server error occurred.");
    }
}

window.deleteService = async function(id) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${window.API_URL}/admin/services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            fetchServices();
            window.showSuccessToast('Service deleted.');
        }
    } catch (err) {
        console.error("Delete error:", err);
    }
};

window.initServiceManagementLogic = initServiceManagementLogic;
