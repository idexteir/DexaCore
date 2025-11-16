console.log("[Home] Module loading...");

(function waitForCore() {
    if (window.DexaCore && window.DexaCore.events && window.Entities) {
        console.log("[Home] Dependencies ready");
        init();
    } else {
        setTimeout(waitForCore, 50);
    }
})();

function init() {
    DexaCore.events.on("page:loaded", async (page) => { 
        if (page !== "home") return;

        console.log("[Home] Page loaded, loading properties...");
        await loadProperties();
    });
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
        const activeProperties = allProperties.filter(property => 
            property.status && property.status.toLowerCase() === 'active'
        );

        console.log("[Home] Active properties:", activeProperties);

        // Limit to 6 properties for home page
        const properties = activeProperties.slice(0, 6);

        if (!properties || properties.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>No Active Properties Available</h3>
                    <p>Check back soon for new listings!</p>
                    <button class="btn-primary" onclick="DexaCore.router.go('/properties')">
                        Browse All Properties
                    </button>
                </div>
            `;
            return;
        }

        // Generate property cards
        grid.innerHTML = properties.map(property => createPropertyCard(property)).join('');

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

function createPropertyCard(property) {
    return `
        <div class="property-card" onclick="viewProperty('${property.id}')">
            <div class="property-thumbnail">
                ${property.image_url 
                    ? `<img src="${property.image_url}" alt="${property.title}">` 
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
                        <div class="property-price">$${formatPrice(property.price)}</div>
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
    // For now, navigate to properties page
    // Later, create a property detail page: /property/{id}
    DexaCore.router.go('/properties');
};

console.log("[Home] Module loaded");
