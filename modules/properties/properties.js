console.log("[Properties] Initializing...");

(function waitForCore() {
    if (window.DexaCore && window.DexaCore.events && window.Entities && window.Crud) {
        console.log("[Properties] Dependencies ready, initializing...");
        init();
    } else {
        console.log("[Properties] Waiting for dependencies...");
        setTimeout(waitForCore, 50);
    }
})();

async function init() {
    console.log("[Properties] Init function called");

    DexaCore.events.on("page:loaded", async (pageName) => {
        if (pageName !== "properties") return;

        console.log("[Properties] Page loaded, setting up CRUD...");

        try {
            // Fetch both CRUD templates
            const [pageHtml, formHtml] = await Promise.all([
                fetch("/ui/crud/crud.page.html").then(r => r.text()),
                fetch("/ui/crud/crud.form.html").then(r => r.text())
            ]);

            // Find container
            const container = document.getElementById("properties-crud");
            if (!container) {
                throw new Error("#properties-crud container not found");
            }

            // Insert HTML
            container.innerHTML = pageHtml + formHtml;
            console.log("[Properties] CRUD HTML inserted");

            // Initialize CRUD
            await Crud.init("Property");
            console.log("[Properties] CRUD initialized successfully");

        } catch (err) {
            console.error("[Properties] Failed to initialize:", err);
            
            const container = document.getElementById("properties-crud");
            if (container) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <h3 style="color: #dc2626; margin-bottom: 20px;">Failed to Load Properties</h3>
                        <p style="margin-bottom: 20px;">${err.message}</p>
                        <button onclick="location.reload()" class="btn-primary">Reload Page</button>
                    </div>
                `;
            }
        }
    });
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
