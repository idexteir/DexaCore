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
            useDB: config.useDB ?? true  // true by default
        };

        console.log(`%c[Entities] Registered: ${name}`, "color:#22c55e;");
    },

    async list(name) {
        const entity = this.registry[name];

        if (entity.useDB) {
            try {
                return await DexaCore.supabase.select(entity.table);
            } catch (e) {
                console.warn("DB error, fallback to local:", e);
                return DexaStorage.get(entity.storageKey, []);
            }
        }

        return DexaStorage.get(entity.storageKey, []);
    },

    async save(name, data) {
        const entity = this.registry[name];

        if (entity.useDB) {
            // INSERT
            if (!data.id) {
                const inserted = await DexaCore.supabase.insert(entity.table, data);
                DexaCore.events.emit(`entity:${name}:created`, inserted);
                return inserted;
            }

            // UPDATE
            const updated = await DexaCore.supabase.update(entity.table, data.id, data);
            DexaCore.events.emit(`entity:${name}:updated`, updated);
            return updated;
        }

        // ---------- Local Fallback ----------
        let list = DexaStorage.get(entity.storageKey, []);

        if (!data.id) {
            data.id = Date.now().toString();
            list.push(data);
        } else {
            const i = list.findIndex(x => x.id === data.id);
            if (i >= 0) list[i] = data;
        }

        DexaStorage.set(entity.storageKey, list);
        return data;
    },

    async delete(name, id) {
        const entity = this.registry[name];

        if (entity.useDB) {
            await DexaCore.supabase.delete(entity.table, id);
            DexaCore.events.emit(`entity:${name}:deleted`, id);
            return;
        }

        const list = DexaStorage
            .get(entity.storageKey, [])
            .filter(x => x.id !== id);

        DexaStorage.set(entity.storageKey, list);
    }
};
