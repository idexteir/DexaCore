window.DexaCore = {

    async init() {
        console.log("%c[DexaCore] Booting...", "color:#4caf50");

        // Load config
        this.config = window.DexaCoreConfig;

        // Core systems
        this.events = new DexaEvents();
        this.storage = new DexaStorage();
        this.session = new DexaSession();

        // Supabase (singleton object, NOT a constructor)
        if (typeof DexaSupabase === "object") {
            DexaSupabase.init();
            this.supabase = DexaSupabase;
        } else {
            console.error("DexaSupabase is missing or not loaded.");
        }

        // Auth system
        this.auth = new DexaAuth();

        // Permissions
        if (typeof DexaPermissions === "function") {
            this.permissions = new DexaPermissions();
        } else {
            console.warn("DexaPermissions not found.");
        }

        // Roles (optional)
        if (typeof DexaRoles === "function") {
            this.roles = new DexaRoles();
            await this.roles.loadRoles();
        } else {
            console.warn("DexaRoles not found (skipping).");
        }

        // Router (must be last)
        this.router = new DexaRouter();

        // Completed
        this.ready();
    },

    ready() {
        console.log("%c[DexaCore] Ready", "color:#2196f3");
        this.events.emit("core:ready");
    }
};

document.addEventListener("DOMContentLoaded", () => DexaCore.init());
