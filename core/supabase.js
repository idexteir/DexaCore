console.log("[Supabase] Loading...");

export const DexaSupabase = {
    client: null,

    init() {
        if (!window.supabase) {
            console.error("[Supabase] Library not loaded");
            return;
        }

        const config = window.DexaCoreConfig?.supabase;
        if (!config?.url || !config?.anonKey) {
            console.error("[Supabase] Configuration missing");
            return;
        }

        try {
            this.client = window.supabase.createClient(config.url, config.anonKey);
            console.log("[Supabase] Initialized");
        } catch (err) {
            console.error("[Supabase] Init error:", err);
        }
    },

    getClient() {
        return this.client;
    }
};

console.log("[Supabase] Module loaded");

export default DexaSupabase;
