import { renderPropertyForm, getPropertyFormData } from './property-form.js';

console.log("[Properties] Module loading...");

export async function render(container) {
    console.log("[Properties] Render called");
    console.log("[Properties] Container:", container);
    
    const user = DexaCore.session?.getUser();
    console.log("[Properties] Current user:", user);
    
    if (!user) {
        console.warn("[Properties] No user found, showing access denied");
        container.innerHTML = `
            <div class="empty-state">
                <h2>Access Denied</h2>
                <p>Please log in to manage properties.</p>
                <button class="btn-primary" onclick="DexaCore.router.go('/login')">Login</button>
            </div>
        `;
        return;
    }

    // Check if we're in edit/create mode
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const isCreate = urlParams.get('create') === 'true';
    
    console.log("[Properties] URL params:", { editId, isCreate });

    if (isCreate) {
        console.log("[Properties] Showing create form");
        await renderCreateForm(container);
    } else if (editId) {
        console.log("[Properties] Showing edit form for:", editId);
        await renderEditForm(container, editId);
    } else {
        console.log("[Properties] Showing list view");
        await renderListView(container, user);
    }
    
    console.log("[Properties] Render complete");
}

// List View
async function renderListView(container, user) {
    console.log("[Properties] Rendering list view for user:", user.id);
    
    container.innerHTML = `
        <div class="properties-page">
            <div class="properties-header">
                <h1>My Properties</h1>
                <button class="btn-primary" onclick="DexaCore.router.go('/properties?create=true')">
                    ➕ Add New Property
                </button>
            </div>
            
            <div id="properties-list">
                <div class="loading">Loading properties...</div>
            </div>
        </div>
    `;
    
    console.log("[Properties] List view HTML rendered");

    try {
        console.log("[Properties] Fetching properties from Entities...");
        
        // Fetch user's properties
        const properties = await Entities.list("Property", {
            filters: { user_id: user.id },
            sortBy: "created_at",
            sortAsc: false
        });

        console.log("[Properties] Loaded properties:", properties);
        console.log("[Properties] Total properties:", properties.length);

        const listEl = document.getElementById("properties-list");
        console.log("[Properties] List element:", listEl);

        if (properties.length === 0) {
            console.log("[Properties] No properties, showing empty state");
            listEl.innerHTML = `
                <div class="empty-state">
                    <h3>No Properties Yet</h3>
                    <p>Create your first property to get started!</p>
                    <button class="btn-primary" onclick="DexaCore.router.go('/properties?create=true')">
                        ➕ Add Property
                    </button>
                </div>
            `;
            return;
        }

        console.log("[Properties] Rendering properties table");
        
        // Render properties table
        listEl.innerHTML = `
            <div class="crud-table-container">
                <table class="crud-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Price</th>
                            <th>Bedrooms</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${properties.map(prop => {
                            console.log("[Properties] Rendering row for:", prop.title);
                            return `
                                <tr>
                                    <td><strong>${prop.title}</strong></td>
                                    <td>${prop.type || '—'}</td>
                                    <td>${prop.location || '—'}</td>
                                    <td class="price-cell">${prop.price || '—'}</td>
                                    <td class="capacity-cell">${prop.bedrooms || '—'}</td>
                                    <td>
                                        <span class="status-badge ${prop.status || 'hidden'}">
                                            ${prop.status || 'hidden'}
                                        </span>
                                    </td>
                                    <td class="crud-actions">
                                        <button class="btn-edit" onclick="DexaCore.router.go('/properties?edit=${prop.id}')">
                                            ✏️ Edit
                                        </button>
                                        <button class="btn-delete" onclick="window.deleteProperty('${prop.id}', '${prop.title}')">
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        console.log("[Properties] Table rendered successfully");

    } catch (err) {
        console.error("[Properties] Failed to load:", err);
        console.error("[Properties] Error stack:", err.stack);
        
        document.getElementById("properties-list").innerHTML = `
            <div class="empty-state">
                <h3>Failed to Load Properties</h3>
                <p>${err.message}</p>
                <button class="btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Create Form
async function renderCreateForm(container) {
    console.log("[Properties] Rendering create form");
    
    try {
        const formHtml = renderPropertyForm();
        console.log("[Properties] Form HTML generated, length:", formHtml.length);
        
        container.innerHTML = formHtml;
        console.log("[Properties] Form HTML inserted into container");
        
        // Attach form submit handler
        const form = document.getElementById('property-form');
        console.log("[Properties] Form element:", form);
        
        if (!form) {
            console.error("[Properties] Form element not found after rendering!");
            return;
        }
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            console.log("[Properties] Form submitted");
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating...";
            
            try {
                const data = getPropertyFormData();
                console.log("[Properties] Form data:", data);
                
                // Add user_id
                const user = DexaCore.session.getUser();
                data.user_id = user.id;
                
                console.log("[Properties] Creating property with data:", data);
                
                const created = await Entities.create("Property", data);
                console.log("[Properties] Property created:", created);
                
                alert("✅ Property created successfully!");
                DexaCore.router.go('/properties');
                
            } catch (err) {
                console.error("[Properties] Create failed:", err);
                console.error("[Properties] Error stack:", err.stack);
                alert("❌ Failed to create property: " + err.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "Create Property";
            }
        };
        
        console.log("[Properties] Form submit handler attached");
        
    } catch (err) {
        console.error("[Properties] Failed to render create form:", err);
        console.error("[Properties] Error stack:", err.stack);
        container.innerHTML = `
            <div class="empty-state">
                <h3>Failed to Load Form</h3>
                <p>${err.message}</p>
                <button class="btn-primary" onclick="DexaCore.router.go('/properties')">
                    Back to Properties
                </button>
            </div>
        `;
    }
}

// Edit Form
async function renderEditForm(container, propertyId) {
    console.log("[Properties] Rendering edit form for:", propertyId);
    
    container.innerHTML = `<div class="loading">Loading property...</div>`;
    
    try {
        const property = await Entities.get("Property", propertyId);
        console.log("[Properties] Loaded property:", property);
        
        if (!property) {
            console.warn("[Properties] Property not found");
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Property Not Found</h3>
                    <button class="btn-primary" onclick="DexaCore.router.go('/properties')">
                        Back to Properties
                    </button>
                </div>
            `;
            return;
        }
        
        // Check ownership
        const user = DexaCore.session.getUser();
        if (property.user_id !== user.id && user.role !== 'admin') {
            console.warn("[Properties] Access denied for user:", user.id);
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Access Denied</h3>
                    <p>You don't have permission to edit this property.</p>
                    <button class="btn-primary" onclick="DexaCore.router.go('/properties')">
                        Back to Properties
                    </button>
                </div>
            `;
            return;
        }
        
        const formHtml = renderPropertyForm(property);
        container.innerHTML = formHtml;
        
        // Attach form submit handler
        const form = document.getElementById('property-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            console.log("[Properties] Edit form submitted");
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Updating...";
            
            try {
                const data = getPropertyFormData();
                console.log("[Properties] Update data:", data);
                
                await Entities.update("Property", propertyId, data);
                console.log("[Properties] Property updated");
                
                alert("✅ Property updated successfully!");
                DexaCore.router.go('/properties');
                
            } catch (err) {
                console.error("[Properties] Update failed:", err);
                alert("❌ Failed to update property: " + err.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "Update Property";
            }
        };
        
    } catch (err) {
        console.error("[Properties] Failed to load property:", err);
        container.innerHTML = `
            <div class="empty-state">
                <h3>Failed to Load Property</h3>
                <p>${err.message}</p>
                <button class="btn-primary" onclick="DexaCore.router.go('/properties')">
                    Back to Properties
                </button>
            </div>
        `;
    }
}

// Global delete function
window.deleteProperty = async function(id, title) {
    console.log("[Properties] Delete requested for:", id);
    
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) {
        console.log("[Properties] Delete cancelled");
        return;
    }
    
    try {
        await Entities.delete("Property", id);
        console.log("[Properties] Property deleted:", id);
        alert("✅ Property deleted successfully!");
        location.reload();
    } catch (err) {
        console.error("[Properties] Delete failed:", err);
        alert("❌ Failed to delete property: " + err.message);
    }
};

console.log("[Properties] Module loaded");
