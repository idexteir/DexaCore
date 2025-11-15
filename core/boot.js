window.DexaCore = {

    async init() {
        console.log("[DexaCore] Booting...");

        this.config = DexaCoreConfig;

        this.events = new DexaEvents();
        this.session = new DexaSession();
        this.supabase = DexaSupabase;
        this.roles = new DexaRoles();
        this.permissions = new DexaPermissions();
        this.router = new DexaRouter();

        await this.roles.loadRoles();

        console.log("[DexaCore] Ready");
        this.events.emit("core:ready");
    }
};

document.addEventListener("DOMContentLoaded", () => DexaCore.init());
