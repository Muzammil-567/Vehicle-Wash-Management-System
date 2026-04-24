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

window.openEditServiceModal = async function(id) {
    const card = document.querySelector(`.service-card[data-id="${id}"]`);
    if (!card) return;

    window.currentEditingServiceId = id;
    
    document.getElementById('modal-title').textContent = 'Edit Wash Service';
    document.getElementById('service-name').value = card.querySelector('h3').textContent;
    document.getElementById('service-price').value = card.querySelector('.price-tag').textContent;
    document.getElementById('service-description').value = card.querySelector('p').textContent;
    
    // Handle features field if it exists
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
            await saveServiceChanges();
        };
    }
};

async function saveServiceChanges() {
    const id = window.currentEditingServiceId;
    const token = localStorage.getItem('token');
    
    const featValue = document.getElementById('service-features')?.value || '';
    const data = {
        service_name: document.getElementById('service-name').value,
        price: document.getElementById('service-price').value,
        description: document.getElementById('service-description').value,
        category: 'Main Service',
        features: featValue.split(',').map(f => f.trim()).filter(f => f !== ''),
        is_active: 1
    };

    try {
        const response = await fetch(`${window.API_URL}/admin/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const modal = document.getElementById('admin-modal-overlay');
            if (modal) modal.classList.remove('active');
            fetchServices();
            window.showSuccessToast('Service updated successfully.');
        } else {
            const err = await response.json();
            alert("Error: " + err.message);
        }
    } catch (err) {
        console.error("Save error:", err);
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
