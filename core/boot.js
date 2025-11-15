window.DexaCore = {
    async init() {
        console.log("%c[DexaCore] Booting...", "color:#4caf50");
        this.config = DexaCoreConfig;
        this.events = new DexaEvents();
        this.session = new DexaSession();
        this.router = new DexaRouter();
        this.supabase = DexaSupabase;
        // DexaCore.auth gets attached after core:ready by auth.js
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
