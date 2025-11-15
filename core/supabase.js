class DexaSupabase {
    constructor() {
        const cfg = DexaCore.config.supabase;

        this.client = window.supabase.createClient(cfg.url, cfg.anonKey);
    }

    // ---------- AUTH ----------
    async signIn(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return data.user;
    }

    async signUp(email, password) {
        const { data, error } = await this.client.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        return data.user;
    }

    async signOut() {
        await this.client.auth.signOut();
    }

    async getSession() {
        const { data } = await this.client.auth.getSession();
        return data.session;
    }

    // ---------- DATABASE ----------
    async select(table, filters = {}) {
        let query = this.client.from(table).select("*");

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key]);
        });

        const { data, error } = await query;
        if (error) throw error;

        return data;
    }

    async insert(table, values) {
        const { data, error } = await this.client
            .from(table)
            .insert(values)
            .select();

        if (error) throw error;

        return data[0];
    }

    async update(table, id, values) {
        const { data, error } = await this.client
            .from(table)
            .update(values)
            .eq("id", id)
            .select();

        if (error) throw error;

        return data[0];
    }

    async delete(table, id) {
        const { error } = await this.client
            .from(table)
            .delete()
            .eq("id", id);

        if (error) throw error;

        return true;
    }

    // ---------- STORAGE ----------
    async upload(bucket, path, file) {
        const { data, error } = await this.client.storage
            .from(bucket)
            .upload(path, file);

        if (error) throw error;

        return data;
    }

    fileURL(bucket, path) {
        return `${DexaCore.config.supabase.url}/storage/v1/object/public/${bucket}/${path}`;
    }
}
