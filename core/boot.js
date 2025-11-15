window.DexaCore = {

    async init() {
        console.log("%c[DexaCore] Booting...", "color:#4caf50");

        this.config = DexaCoreConfig;

        this.events = new DexaEvents();
        this.session = new DexaSession();
        this.router = new DexaRouter();
        this.supabase = new DexaSupabase();
        this.auth = new DexaAuth();
        this.roles = new DexaRoles();
        this.permissions = new DexaPermissions();

        // Load role definitions
        await this.roles.loadRoles();

        this.ready();
    },

    ready() {
        console.log("%c[DexaCore] Ready", "color:#2196f3");
        this.events.emit("core:ready");
    }
};

document.addEventListener("DOMContentLoaded", () => DexaCore.init());
