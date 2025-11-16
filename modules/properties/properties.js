(function waitForCore() {
    if (window.DexaCore && DexaCore.events) {
        init();
    } else {
        setTimeout(waitForCore, 50);
    }
})();

function init() {
    console.log("[Properties] Initializing...");
    
    DexaCore.events.on("page:loaded", async (page) => {
        if (page !== "properties") return;

        try {
            const crudHtml = await fetch("/ui/crud/crud.page.html").then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            });
            const crudFormHtml = await fetch("/ui/crud/crud.form.html").then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            });
            
            const container = document.querySelector("#properties-crud");
            if (!container) {
                throw new Error("Properties container not found");
            }
            
            container.innerHTML = crudHtml + crudFormHtml;
            await Crud.init("Property");
            
        } catch (err) {
            console.error("[Properties] Failed to load CRUD:", err);
            if (window.DexaToast) DexaToast.error("Failed to load properties interface");
            
            const container = document.querySelector("#properties-crud");
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <p style="color: #dc2626; margin-bottom: 20px;">Failed to load properties: ${err.message}</p>
                        <button onclick="location.reload()" class="btn-primary">Reload Page</button>
                    </div>
                `;
            }
        }
    });

    // DELETE THIS ENTIRE BLOCK (lines 56-90)
    // The Property entity is already registered in entities.js with user_id field
}

(function() {
    console.log("[Properties] Module loading...");

    window.PropertiesModule = {
        async init() {
            console.log("[Properties] Initializing...");
            await this.loadProperties();
        },

        async loadProperties() {
            const grid = document.getElementById("properties-grid");
            if (!grid) return;

            try {
                const { data, error } = await DexaCore.supabase.client
                    .from("properties")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;

                if (!data || data.length === 0) {
                    grid.innerHTML = `
                        <div class="empty-state">
                            <h3>No Properties Yet</h3>
                            <p>Get started by adding your first property</p>
                            <button class="btn btn-primary" onclick="PropertiesModule.openCreateModal()">
                                + Add Property
                            </button>
                        </div>
                    `;
                    return;
                }

                grid.innerHTML = data.map(property => `
                    <div class="property-card">
                        <h3>${property.name || "Untitled Property"}</h3>
                        <p>${property.address || "No address"}</p>
                        <div class="property-actions">
                            <button class="btn btn-sm" onclick="PropertiesModule.edit('${property.id}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="PropertiesModule.delete('${property.id}')">Delete</button>
                        </div>
                    </div>
                `).join("");

            } catch (err) {
                console.error("[Properties] Load error:", err);
                grid.innerHTML = `<p class="error-message">Failed to load properties: ${err.message}</p>`;
            }
        },

        openCreateModal() {
            DexaToast.info("Property creation coming soon!");
        },

        edit(id) {
            DexaToast.info("Edit functionality coming soon!");
        },

        delete(id) {
            DexaToast.info("Delete functionality coming soon!");
        }
    };

    // Auto-initialize when page loads
    if (DexaCore && DexaCore.events) {
        DexaCore.events.on("page:loaded", (page) => {
            if (page === "properties") {
                PropertiesModule.init();
            }
        });
    }
})();
