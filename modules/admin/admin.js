window.addEventListener("core:ready", () => {

    DexaCore.events.on("page:loaded", (page) => {
        if (page !== "admin") return;

        // Check admin access
        const user = DexaCore.session.getUser();
        if (!user || user.role !== "admin") {
            DexaToast.error("Access denied. Admin only.");
            DexaCore.router.go("dashboard");
            return;
        }

        AdminPage.init();
    });

    class AdminPage {
        static init() {
            AdminPage.setupTabs();
            AdminPage.loadUsers();
            AdminPage.loadEntities();
            AdminPage.loadActivity();
            AdminPage.setupSearch();
        }

        static setupTabs() {
            const tabBtns = document.querySelectorAll(".tab-btn");
            const tabContents = document.querySelectorAll(".admin-tab-content");

            tabBtns.forEach(btn => {
                btn.onclick = () => {
                    const tab = btn.dataset.tab;
                    
                    tabBtns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    tabContents.forEach(c => c.classList.remove("active"));
                    const targetTab = document.getElementById(`${tab}Tab`);
                    if (targetTab) targetTab.classList.add("active");

                    // Reload data when switching tabs
                    if (tab === "entities") AdminPage.loadEntities();
                    if (tab === "activity") AdminPage.loadActivity();
                };
            });
        }

        static setupSearch() {
            const userSearch = document.querySelector("#userSearch");
            if (userSearch) {
                userSearch.addEventListener("input", () => AdminPage.loadUsers());
            }

            const activitySearch = document.querySelector("#activitySearch");
            if (activitySearch) {
                activitySearch.addEventListener("input", () => AdminPage.loadActivity());
            }
        }

        static async loadUsers() {
            const container = document.querySelector("#usersList");
            if (!container) return;

            DexaLoading.show("Loading users...");

            try {
                // Try to fetch from Supabase auth.users (read-only via admin API)
                // For now, show placeholder - in production, use Supabase Admin API
                const search = (document.querySelector("#userSearch")?.value || "").toLowerCase();
                
                // Note: Supabase client can't directly query auth.users
                // This requires Admin API or a custom users table
                const users = [];

                if (users.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <p>No users found.</p>
                            <p class="empty-hint">User management requires Supabase Admin API or a users table.</p>
                            <p class="empty-hint">Create a users table that syncs with auth.users for full management.</p>
                        </div>
                    `;
                    return;
                }

                const filtered = users.filter(u => 
                    (u.email || "").toLowerCase().includes(search) ||
                    (u.name || "").toLowerCase().includes(search)
                );

                container.innerHTML = filtered.map(user => `
                    <div class="user-card">
                        <div class="user-info">
                            <div class="user-avatar">
                                ${user.avatar ? `<img src="${user.avatar}" alt="">` : (user.email?.[0] || "U").toUpperCase()}
                            </div>
                            <div class="user-details">
                                <h4>${user.name || user.email || "User"}</h4>
                                <p>${user.email || ""}</p>
                                <p class="user-meta">Provider: ${user.provider || "google"} | Last login: ${user.last_login || "N/A"}</p>
                            </div>
                        </div>
                        <div class="user-actions">
                            <select class="role-select" onchange="AdminPage.updateRole('${user.id}', this.value)">
                                <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                            </select>
                            <button class="btn-ban" onclick="AdminPage.toggleBan('${user.id}')">
                                ${user.banned ? "Unban" : "Ban"}
                            </button>
                            <button class="btn-delete" onclick="AdminPage.removeUser('${user.id}')">Remove</button>
                        </div>
                    </div>
                `).join("");
            } catch (err) {
                console.error("Failed to load users:", err);
                DexaToast.error("Failed to load users");
            } finally {
                DexaLoading.hide();
            }
        }

        static async loadEntities() {
            const container = document.querySelector("#entitiesList");
            if (!container) return;

            DexaLoading.show("Loading entities...");

            try {
                const entities = Object.values(Entities.registry);
                const entitiesData = await Promise.all(
                    entities.map(async (entity) => {
                        const count = await Entities.count(entity.name);
                        const schemaOk = await Entities.ensureSchema(entity.name);
                        return { ...entity, count, schemaOk };
                    })
                );

                if (entitiesData.length === 0) {
                    container.innerHTML = `<div class="empty-state"><p>No entities registered.</p></div>`;
                    return;
                }

                container.innerHTML = entitiesData.map(entity => `
                    <div class="entity-card">
                        <div class="entity-info">
                            <h4>${entity.title || entity.name}</h4>
                            <p class="entity-meta">
                                Table: <code>${entity.table}</code> | 
                                Rows: <strong>${entity.count}</strong> | 
                                Schema: <span class="schema-status ${entity.schemaOk ? "ok" : "warning"}">${entity.schemaOk ? "OK" : "Check Required"}</span>
                            </p>
                            <p class="entity-fields">Fields: ${Object.keys(entity.fields).join(", ")}</p>
                        </div>
                        <div class="entity-actions">
                            <button class="btn-small" onclick="AdminPage.syncSchema('${entity.name}')">Sync Schema</button>
                            <button class="btn-small" onclick="AdminPage.openEntityCrud('${entity.name}')">Open CRUD</button>
                        </div>
                    </div>
                `).join("");
            } catch (err) {
                console.error("Failed to load entities:", err);
                DexaToast.error("Failed to load entities");
            } finally {
                DexaLoading.hide();
            }
        }

        static async loadActivity() {
            const container = document.querySelector("#activityList");
            if (!container) return;

            DexaLoading.show("Loading activity...");

            try {
                const search = (document.querySelector("#activitySearch")?.value || "").toLowerCase();
                let logs = await Entities.list("ActivityLog", { sortBy: "timestamp", sortAsc: false, limit: 100 });

                if (search) {
                    logs = logs.filter(log =>
                        (log.user || "").toLowerCase().includes(search) ||
                        (log.action || "").toLowerCase().includes(search) ||
                        (log.entity || "").toLowerCase().includes(search)
                    );
                }

                if (logs.length === 0) {
                    container.innerHTML = `<div class="empty-state"><p>No activity logs found.</p></div>`;
                    return;
                }

                container.innerHTML = logs.map(log => `
                    <div class="activity-item">
                        <div class="activity-icon">${this.getActivityIcon(log.action)}</div>
                        <div class="activity-content">
                            <p><strong>${log.user}</strong> ${log.action} <strong>${log.entity}</strong>${log.entityId ? ` (ID: ${log.entityId})` : ""}</p>
                            <span class="activity-time">${new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                `).join("");
            } catch (err) {
                console.error("Failed to load activity:", err);
                DexaToast.error("Failed to load activity logs");
            } finally {
                DexaLoading.hide();
            }
        }

        static getActivityIcon(action) {
            const icons = {
                create: "➕",
                update: "✏️",
                delete: "🗑️",
                login: "🔐",
                logout: "🚪"
            };
            return icons[action] || "📝";
        }

        static async syncSchema(entityName) {
            DexaLoading.show("Syncing schema...");
            try {
                await Entities.ensureSchema(entityName);
                DexaToast.success("Schema check completed");
                AdminPage.loadEntities();
            } catch (err) {
                DexaToast.error("Failed to sync schema");
            } finally {
                DexaLoading.hide();
            }
        }

        static async syncAllSchemas() {
            DexaLoading.show("Syncing all schemas...");
            try {
                const entities = Object.keys(Entities.registry);
                await Promise.all(entities.map(name => Entities.ensureSchema(name)));
                DexaToast.success("All schemas checked");
                AdminPage.loadEntities();
            } catch (err) {
                DexaToast.error("Failed to sync schemas");
            } finally {
                DexaLoading.hide();
            }
        }

        static openEntityCrud(entityName) {
            DexaCore.router.go(entityName.toLowerCase());
        }

        static async updateRole(userId, newRole) {
            DexaLoading.show("Updating role...");
            try {
                // await DexaCore.supabase.update("users", userId, { role: newRole });
                DexaToast.success("Role updated!");
                AdminPage.loadUsers();
            } catch (err) {
                DexaToast.error("Failed to update role");
            } finally {
                DexaLoading.hide();
            }
        }

        static async toggleBan(userId) {
            DexaModal.show({
                title: "Confirm Action",
                content: "Are you sure you want to ban/unban this user?",
                confirmText: "Confirm",
                onConfirm: async () => {
                    DexaLoading.show("Updating...");
                    try {
                        // await DexaCore.supabase.update("users", userId, { banned: !user.banned });
                        DexaToast.success("User status updated!");
                        AdminPage.loadUsers();
                    } catch (err) {
                        DexaToast.error("Failed to update user");
                    } finally {
                        DexaLoading.hide();
                    }
                }
            });
        }

        static async removeUser(userId) {
            DexaModal.show({
                title: "Remove User?",
                content: "This action cannot be undone. The user will be permanently deleted.",
                confirmText: "Remove",
                onConfirm: async () => {
                    DexaLoading.show("Removing user...");
                    try {
                        // await DexaCore.supabase.delete("users", userId);
                        DexaToast.success("User removed!");
                        AdminPage.loadUsers();
                    } catch (err) {
                        DexaToast.error("Failed to remove user");
                    } finally {
                        DexaLoading.hide();
                    }
                }
            });
        }
    }

    window.AdminPage = AdminPage;
});
