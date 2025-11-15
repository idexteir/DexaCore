window.DexaSupabase = {

    client: null,

    init() {
        const cfg = window.DexaCoreConfig.supabase;

        this.client = supabase.createClient(cfg.url, cfg.anonKey, {
            auth: {
                persistSession: true,
                detectSessionInUrl: true
            }
        });

        console.log("[DexaCore] Supabase initialized");
    },

    async getUser() {
        const { data } = await this.client.auth.getUser();
        return data?.user || null;
    }
};
