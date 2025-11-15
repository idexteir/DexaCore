const DexaSupabase = {
    client: null,

    init() {
        const cfg = window.DexaCoreConfig.supabase;
        this.client = supabase.createClient(cfg.url, cfg.anonKey);
        console.log("[DexaCore] Supabase initialized");
    },

    auth: {
        async login(email, password) {
            return await DexaSupabase.client.auth.signInWithPassword({ email, password });
        },
        async register(email, password) {
            return await DexaSupabase.client.auth.signUp({ email, password });
        },
        async logout() {
            return await DexaSupabase.client.auth.signOut();
        },
        async getCurrent() {
            return await DexaSupabase.client.auth.getUser();
        }
    }
};
