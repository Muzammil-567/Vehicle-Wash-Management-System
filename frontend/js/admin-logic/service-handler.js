/**
 * Service Management Handler - Logic for Service Cards, Deletion, and Advanced Editing
 */

function initServiceManagementLogic() {
    console.log('Initializing Service Management Logic...');
    fetchServices();
}

async function fetchServices() {
    const container = document.getElementById('service-grid');
    const token = localStorage.getItem('token');
    if (!container || !token) return;

    try {
        const response = await fetch('http://localhost:5000/api/admin/services', {
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
        const features = JSON.parse(service.features || '[]');
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
        // Get existing service data first or just send partial update if backend supports it
        // For simplicity, we'll fetch all services again after update
        const response = await fetch(`http://localhost:5000/api/admin/services/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_active: isActive ? 1 : 0 })
        });
        
        if (response.ok) {
            fetchServices();
        }
    } catch (err) {
        console.error("Toggle error:", err);
    }
};

window.openEditServiceModal = async function(id) {
    // Implementation for opening modal and populating fields
    // Similar to handleServiceEdit but fetching from current data
    const card = document.querySelector(`.service-card[data-id="${id}"]`);
    if (!card) return;

    window.currentEditingServiceId = id;
    
    document.getElementById('service-name').value = card.querySelector('h3').textContent;
    document.getElementById('service-price').value = card.querySelector('.price-tag').textContent;
    document.getElementById('service-description').value = card.querySelector('p').textContent;
    
    const modal = document.getElementById('admin-modal-overlay');
    modal.classList.add('active');
    
    const form = document.getElementById('service-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        saveServiceChanges();
    };
};

async function saveServiceChanges() {
    const id = window.currentEditingServiceId;
    const token = localStorage.getItem('token');
    const data = {
        service_name: document.getElementById('service-name').value,
        price: document.getElementById('service-price').value,
        description: document.getElementById('service-description').value,
        category: 'Main Service', // Default for now
        is_active: 1
    };

    try {
        const response = await fetch(`http://localhost:5000/api/admin/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('admin-modal-overlay').classList.remove('active');
            fetchServices();
            showSuccessToast('Service updated successfully.');
        }
    } catch (err) {
        console.error("Save error:", err);
    }
}

window.deleteService = async function(id) {
    if (!confirm("Are you sure?")) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/admin/services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) fetchServices();
    } catch (err) {
        console.error("Delete error:", err);
    }
};

window.initServiceManagementLogic = initServiceManagementLogic;
