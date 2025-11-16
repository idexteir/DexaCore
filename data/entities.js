window.Entities = {
    registry: {},

    register(name, config) {
        this.registry[name] = {
            name,
            fields: config.fields || {},
            permissions: config.permissions || {},
            title: config.title || name,
            table: config.table || name.toLowerCase(),
            storageKey: config.storageKey || `entity_${name.toLowerCase()}`,
            useDB: config.useDB ?? true
        };

        console.log(`%c[Entities] Registered: ${name}`, "color:#22c55e;");
    },

    getFields(name) {
        const entity = this.registry[name];
        return entity ? entity.fields : {};
    },

    async ensureTable(name) {
        const entity = this.registry[name];
        if (!entity || !entity.useDB) return;

        try {
            // Check if table exists by trying to select from it
            await DexaCore.supabase.select(entity.table, { limit: 1 });
            console.log(`[Entities] Table ${entity.table} exists`);
        } catch (err) {
            console.warn(`[Entities] Table ${entity.table} may not exist. Create it in Supabase dashboard.`);
            // Note: Supabase doesn't allow table creation via client SDK
            // This is a placeholder - actual table creation must be done in Supabase dashboard
        }
    },

    async ensureSchema(name) {
        const entity = this.registry[name];
        if (!entity || !entity.useDB) return;

        try {
            // Check schema by getting one row
            const result = await DexaCore.supabase.select(entity.table, { limit: 1 });
            console.log(`[Entities] Schema check for ${entity.table}: OK`);
            return true;
        } catch (err) {
            console.warn(`[Entities] Schema issue for ${entity.table}:`, err);
            return false;
        }
    },

    async query(name, options = {}) {
        const entity = this.registry[name];
        if (!entity) throw new Error(`Entity ${name} not found`);

        if (entity.useDB) {
            try {
                let query = DexaCore.supabase.client.from(entity.table).select("*");

                // Filters
                if (options.filters) {
                    Object.keys(options.filters).forEach(key => {
                        const value = options.filters[key];
                        if (value !== null && value !== undefined && value !== "") {
                            query = query.eq(key, value);
                        }
                    });
                }

                // Search
                if (options.search && options.searchField) {
                    query = query.ilike(options.searchField, `%${options.search}%`);
                }

                // Sort
                if (options.sortBy) {
                    query = query.order(options.sortBy, { ascending: options.sortAsc !== false });
                }

                // Limit
                if (options.limit) {
                    query = query.limit(options.limit);
                }

                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            } catch (e) {
                console.warn("DB query error, fallback to local:", e);
                return DexaStorage.get(entity.storageKey, []);
            }
        }

        return DexaStorage.get(entity.storageKey, []);
    },

    async paginate(name, page = 1, perPage = 10, options = {}) {
        const entity = this.registry[name];
        if (!entity) throw new Error(`Entity ${name} not found`);

        const offset = (page - 1) * perPage;

        if (entity.useDB) {
            try {
                let query = DexaCore.supabase.client.from(entity.table).select("*", { count: "exact" });

                // Filters
                if (options.filters) {
                    Object.keys(options.filters).forEach(key => {
                        const value = options.filters[key];
                        if (value !== null && value !== undefined && value !== "") {
                            query = query.eq(key, value);
                        }
                    });
                }

                // Search
                if (options.search && options.searchField) {
                    query = query.ilike(options.searchField, `%${options.search}%`);
                }

                // Sort
                if (options.sortBy) {
                    query = query.order(options.sortBy, { ascending: options.sortAsc !== false });
                }

                // Pagination
                query = query.range(offset, offset + perPage - 1);

                const { data, error, count } = await query;
                if (error) throw error;

                return {
                    data: data || [],
                    total: count || 0,
                    page,
                    perPage,
                    totalPages: Math.ceil((count || 0) / perPage)
                };
            } catch (e) {
                console.warn("DB pagination error, fallback to local:", e);
                const all = DexaStorage.get(entity.storageKey, []);
                const start = offset;
                const end = start + perPage;
                return {
                    data: all.slice(start, end),
                    total: all.length,
                    page,
                    perPage,
                    totalPages: Math.ceil(all.length / perPage)
                };
            }
        }

        const all = DexaStorage.get(entity.storageKey, []);
        const start = offset;
        const end = start + perPage;
        return {
            data: all.slice(start, end),
            total: all.length,
            page,
            perPage,
            totalPages: Math.ceil(all.length / perPage)
        };
    },

    async list(name, options = {}) {
        return this.query(name, options);
    },

    async get(name, id) {
        const entity = this.registry[name];
        if (!entity) throw new Error(`Entity ${name} not found`);

        if (entity.useDB) {
            try {
                const { data, error } = await DexaCore.supabase.client
                    .from(entity.table)
                    .select("*")
                    .eq("id", id)
                    .single();
                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("DB get error:", e);
                const list = DexaStorage.get(entity.storageKey, []);
                return list.find(x => x.id === id) || null;
            }
        }

        const list = DexaStorage.get(entity.storageKey, []);
        return list.find(x => x.id === id) || null;
    },

    async create(name, data) {
        return this.save(name, data);
    },

    async update(name, id, data) {
        const entity = this.registry[name];
        if (!entity) throw new Error(`Entity ${name} not found`);

        if (entity.useDB) {
            try {
                // Get Supabase auth user for user_id
                const { data: { user: authUser } } = await DexaCore.supabase.client.auth.getUser();
                
                const dataWithUser = { ...data };
                
                // Add user_id if entity has that field (for ownership verification)
                if (entity.fields.user_id && authUser?.id) {
                    dataWithUser.user_id = authUser.id;
                }

                // Use Supabase client directly
                const { data: updated, error } = await DexaCore.supabase.client
                    .from(entity.table)
                    .update(dataWithUser)
                    .eq("id", id)
                    .select()
                    .single();
                    
                if (error) throw error;
                
                DexaCore.events.emit(`entity:${name}:updated`, updated);
                this.log("update", name, id);
                
                // Update local cache
                const allItems = DexaStorage.get(entity.storageKey, []);
                const index = allItems.findIndex(item => item.id === id);
                if (index >= 0) {
                    allItems[index] = updated;
                    DexaStorage.set(entity.storageKey, allItems);
                }
                
                return updated;
            } catch (e) {
                console.error("DB update error:", e);
                throw e;
            }
        }

        const list = DexaStorage.get(entity.storageKey, []);
        const index = list.findIndex(x => x.id === id);
        if (index >= 0) {
            list[index] = { ...list[index], ...data, id };
            DexaStorage.set(entity.storageKey, list);
            this.log("update", name, id);
            return list[index];
        }
        throw new Error(`Entity ${name} with id ${id} not found`);
    },

    async save(name, data) {
        const entity = this.registry[name];
        if (!entity) throw new Error(`Entity ${name} not found`);

        if (entity.useDB) {
            try {
                // Get current Supabase auth user (NOT DexaCore session user)
                const { data: { user: authUser } } = await DexaCore.supabase.client.auth.getUser();
                
                if (!authUser || !authUser.id) {
                    throw new Error("User not authenticated in Supabase");
                }

                console.log("[Entities] Supabase auth user:", authUser);
                console.log("[Entities] Auth UID:", authUser.id);

                // Add user_id if the entity has a user_id field
                const dataWithUser = { ...data };
                console.log("[Entities] entity.fields:", entity.fields);
                console.log("[Entities] entity.fields.user_id exists?", !!entity.fields.user_id);

                if (entity.fields.user_id) {
                    dataWithUser.user_id = authUser.id;
                    console.log("[Entities] Set user_id to:", dataWithUser.user_id);
                }

                // Remove empty id field
                if (!dataWithUser.id || dataWithUser.id === "") {
                    delete dataWithUser.id;
                }

                console.log("[Entities] Final data to save:", dataWithUser);

                let result;
                if (data.id && data.id !== "") {
                    // Update existing record
                    const { data: updated, error } = await DexaCore.supabase.client
                        .from(entity.table)
                        .update(dataWithUser)
                        .eq("id", data.id)
                        .select()
                        .single();
                    if (error) throw error;
                    result = updated;
                } else {
                    // Create new record
                    const { data: created, error } = await DexaCore.supabase.client
                        .from(entity.table)
                        .insert([dataWithUser])
                        .select()
                        .single();
                    if (error) throw error;
                    result = created;
                }

                // Update local storage cache
                const allItems = DexaStorage.get(entity.storageKey, []);
                const index = allItems.findIndex(item => item.id === result.id);
                if (index >= 0) {
                    allItems[index] = result;
                } else {
                    allItems.push(result);
                }
                DexaStorage.set(entity.storageKey, allItems);

                DexaCore.events.emit("entity:saved", { entity: name, data: result });
                console.log("[Entities] Save successful:", result);
                return result;
            } catch (e) {
                console.error(`[Entities] Save failed for ${name}:`, e);
                if (window.DexaToast) {
                    DexaToast.error(`Failed to save ${entity.title || name}: ${e.message}`);
                }
                throw e;
            }
        }

        // Fallback to local storage only
        const allItems = DexaStorage.get(entity.storageKey, []);
        if (data.id) {
            const index = allItems.findIndex(item => item.id === data.id);
            if (index >= 0) {
                allItems[index] = data;
            }
        } else {
            data.id = Date.now().toString();
            allItems.push(data);
        }
        DexaStorage.set(entity.storageKey, allItems);
        DexaCore.events.emit("entity:saved", { entity: name, data });
        return data;
    },

    async delete(name, id) {
        const entity = this.registry[name];
        if (!entity) throw new Error(`Entity ${name} not found`);

        if (entity.useDB) {
            try {
                // Use Supabase client directly
                const { error } = await DexaCore.supabase.client
                    .from(entity.table)
                    .delete()
                    .eq("id", id);
                
                if (error) throw error;
                
                DexaCore.events.emit(`entity:${name}:deleted`, id);
                this.log("delete", name, id);
                
                // Update local cache
                const allItems = DexaStorage.get(entity.storageKey, []);
                const filtered = allItems.filter(item => item.id !== id);
                DexaStorage.set(entity.storageKey, filtered);
                
            } catch (e) {
                console.error("DB delete error:", e);
                throw e;
            }
        } else {
            const list = DexaStorage.get(entity.storageKey, []).filter(x => x.id !== id);
            DexaStorage.set(entity.storageKey, list);
            this.log("delete", name, id);
        }
    },

    async log(action, entity, entityId) {
        const user = DexaCore.session.getUser();
        if (!user) return;

        try {
            const logData = {
                user: user.email || user.id,
                action,
                entity,
                entityId: entityId || null,
                timestamp: new Date().toISOString()
            };

            // Try to save to activity_logs table if it exists
            if (this.registry["ActivityLog"] && this.registry["ActivityLog"].useDB) {
                try {
                    await DexaCore.supabase.insert("activity_logs", logData);
                } catch (e) {
                    // Table might not exist yet, fall back to localStorage
                    const logs = DexaStorage.get("activity_logs", []);
                    logs.push(logData);
                    DexaStorage.set("activity_logs", logs.slice(-1000)); // Keep last 1000
                }
            } else {
                const logs = DexaStorage.get("activity_logs", []);
                logs.push(logData);
                DexaStorage.set("activity_logs", logs.slice(-1000));
            }
        } catch (err) {
            console.warn("[Entities] Failed to log activity:", err);
        }
    },

    async count(name) {
        const entity = this.registry[name];
        if (!entity) return 0;

        if (entity.useDB) {
            try {
                const { count, error } = await DexaCore.supabase.client
                    .from(entity.table)
                    .select("*", { count: "exact", head: true });
                if (error) throw error;
                return count || 0;
            } catch (e) {
                const list = DexaStorage.get(entity.storageKey, []);
                return list.length;
            }
        }

        const list = DexaStorage.get(entity.storageKey, []);
        return list.length;
    }
};

// Register entities IMMEDIATELY (not inside event listener)
// Register ActivityLog entity
Entities.register("ActivityLog", {
    title: "Activity Logs",
    table: "activity_logs",
    storageKey: "activity_logs",
    useDB: true,
    fields: {
        user: { label: "User", type: "text" },
        action: { label: "Action", type: "text" },
        entity: { label: "Entity", type: "text" },
        entityId: { label: "Entity ID", type: "text" },
        timestamp: { label: "Timestamp", type: "datetime" }
    }
});

// Register Role entity
Entities.register("Role", {
    title: "Roles",
    table: "roles",
    useDB: true,
    storageKey: "dexacore_roles",
    fields: {
        name: { 
            label: "Role Name", 
            type: "text", 
            required: true 
        },
        permissions: { 
            label: "Permissions", 
            type: "textarea", 
            required: false,
            help: "Comma-separated list of permissions"
        }
    }
});

// Register User entity
Entities.register("User", {
    title: "Users",
    table: "users",
    useDB: true,
    storageKey: "dexacore_users",
    fields: {
        email: { label: "Email", type: "email", required: true },
        role: { label: "Role", type: "text", required: true }
    }
});

// Register Property entity
Entities.register("Property", {
    title: "Properties",
    table: "properties",
    useDB: true,
    storageKey: "dexacore_properties",
    fields: {
        user_id: { 
            label: "User ID", 
            type: "hidden", 
            required: true
        },
        title: { 
            label: "Title", 
            type: "text", 
            required: true 
        },
        description: { 
            label: "Description", 
            type: "textarea", 
            required: false 
        },
        price: { 
            label: "Price", 
            type: "number", 
            required: false 
        },
        type: { 
            label: "Type", 
            type: "select", 
            required: false,
            options: [
                { value: "resort", label: "Resort" },
                { value: "apartment", label: "Apartment" }
            ]
        },
        status: { 
            label: "Status", 
            type: "select", 
            required: false,
            options: [
                { value: "active", label: "Active" },
                { value: "hidden", label: "Hidden" }
            ]
        },
        location: { 
            label: "Location", 
            type: "text", 
            required: false 
        }
    }
});

// Register Note entity
Entities.register("Note", {
    title: "Notes",
    table: "notes",
    useDB: true,
    storageKey: "dexacore_notes",
    fields: {
        user_id: { 
            label: "User ID", 
            type: "hidden", 
            required: true
        },
        title: { label: "Title", type: "text", required: true },
        content: { label: "Content", type: "textarea", required: true },
        color: { label: "Color", type: "text", required: false }
    }
});

console.log("[Entities] All entities registered");
