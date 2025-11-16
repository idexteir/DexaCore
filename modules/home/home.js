console.log("[Home] Module loading...");

// Wait for dependencies
if (!window.Entities) {
    console.warn("[Home] Waiting for Entities...");
    await new Promise(resolve => setTimeout(resolve, 100));
}

console.log("[Home] Dependencies ready");

// Store all properties globally for filtering
let allActiveProperties = [];
let currentFilter = 'all';

// Main render function called by router
export async function render(container) {
    console.log("[Home] Rendering home page");
    
    container.innerHTML = `
        <div class="home-page">
            <header class="home-header">
                <h1>Welcome to DexaCore Properties</h1>
                <p>Find your perfect rental property</p>
            </header>

            <!-- Property Type Filters -->
            <div class="filter-section">
                <button class="filter-btn active" data-type="all" onclick="filterByType('all')">
                    All Properties
                </button>
                <button class="filter-btn" data-type="resort" onclick="filterByType('resort')">
                    🏖️ Resorts
                </button>
                <button class="filter-btn" data-type="apartment" onclick="filterByType('apartment')">
                    🏢 Apartments
                </button>
                <button class="filter-btn" data-type="villa" onclick="filterByType('villa')">
                    🏠 Villas
                </button>
                <button class="filter-btn" data-type="house" onclick="filterByType('house')">
                    🏡 Houses
                </button>
            </div>

            <!-- Properties Grid -->
            <div id="properties-grid" class="properties-grid">
                <div class="loading">Loading properties...</div>
            </div>
        </div>
    `;
    
    console.log("[Home] HTML rendered, loading properties...");
    
    // Load properties immediately
    await loadProperties();
}

async function loadProperties() {
    const grid = document.getElementById("properties-grid");
    if (!grid) {
        console.warn("[Home] Properties grid not found");
        return;
    }

    try {
        // Fetch ALL properties from database
        const allProperties = await Entities.list("Property", {
            sortBy: "created_at",
            sortAsc: false
        });

        console.log("[Home] Fetched properties:", allProperties);

        // Filter for ACTIVE properties only
        allActiveProperties = allProperties.filter(property => 
            property.status && property.status.toLowerCase() === 'active'
        );

        console.log("[Home] Active properties:", allActiveProperties);

        // Render with current filter
        renderProperties();

    } catch (err) {
        console.error("[Home] Failed to load properties:", err);
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Failed to Load Properties</h3>
                <p>${err.message}</p>
                <button class="btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

function renderProperties() {
    const grid = document.getElementById("properties-grid");
    if (!grid) return;

    // Filter properties based on selected type
    let filteredProperties = allActiveProperties;
    
    if (currentFilter !== 'all') {
        filteredProperties = allActiveProperties.filter(property => 
            property.type && property.type.toLowerCase() === currentFilter.toLowerCase()
        );
    }

    // Limit to 6 properties for home page
    const properties = filteredProperties.slice(0, 6);

    console.log(`[Home] Showing ${properties.length} properties (filter: ${currentFilter})`);

    if (!properties || properties.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No ${currentFilter !== 'all' ? currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1) : ''} Properties Available</h3>
                <p>Check back soon for new listings!</p>
                <button class="btn-primary" onclick="filterByType('all')">
                    Show All Properties
                </button>
            </div>
        `;
        return;
    }

    // Generate property cards
    grid.innerHTML = properties.map(property => createPropertyCard(property)).join('');
}

window.filterByType = function(type) {
    console.log("[Home] Filter by type:", type);
    
    currentFilter = type;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Re-render properties
    renderProperties();
};

function createPropertyCard(property) {
    return `
        <div class="property-card" onclick="viewProperty('${property.id}')">
            <div class="property-thumbnail">
                ${property.thumbnail_url 
                    ? `<img src="${property.thumbnail_url}" alt="${property.title}">` 
                    : getPropertyIcon(property.type)
                }
                ${property.type ? `<span class="property-type-badge">${property.type}</span>` : ''}
            </div>
            
            <div class="property-details">
                <h3 class="property-title">${escapeHtml(property.title || 'Untitled Property')}</h3>
                
                ${property.location ? `
                    <div class="property-location">
                        <span>📍</span>
                        <span>${escapeHtml(property.location)}</span>
                    </div>
                ` : ''}
                
                ${property.description ? `
                    <p class="property-description">${escapeHtml(property.description)}</p>
                ` : ''}
                
                <div class="property-footer">
                    ${property.price ? `
                        <div class="property-price">${escapeHtml(property.price)}</div>
                    ` : '<div class="property-price">Price on request</div>'}
                    
                    <span class="property-status active">Active</span>
                </div>
            </div>
        </div>
    `;
}

function getPropertyIcon(type) {
    const icons = {
        'resort': '🏖️',
        'apartment': '🏢',
        'villa': '🏠',
        'condo': '🏘️',
        'house': '🏡'
    };
    return `<span style="font-size: 5rem;">${icons[type?.toLowerCase()] || '🏠'}</span>`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US').format(price);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.viewProperty = function(id) {
    console.log("[Home] View property:", id);
    PropertyModal.open(id);
};

console.log("[Home] Module loaded");
