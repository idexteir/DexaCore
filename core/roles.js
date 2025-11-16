console.log("[Roles] Loading...");

export class DexaRoles {
    constructor() {
        this.roles = [];
        console.log("[Roles] Initialized");
    }

    async loadRoles() {
        try {
            if (!window.Entities) {
                console.warn("[Roles] Entities not available, using default roles");
                this.roles = [
                    { name: "admin", permissions: ["*"] },
                    { name: "user", permissions: [] }
                ];
                return;
            }

            const roles = await Entities.list("Role");
            this.roles = roles || [
                { name: "admin", permissions: ["*"] },
                { name: "user", permissions: [] }
            ];
            
            console.log("[Roles] Loaded roles:", this.roles);
        } catch (err) {
            console.error("[Roles] Failed to load:", err);
            this.roles = [
                { name: "admin", permissions: ["*"] },
                { name: "user", permissions: [] }
            ];
        }
    }

    getUserRole() {
        const user = DexaCore.session?.getUser();
        if (!user) return null;

        return this.roles.find(r => r.name === user.role) || this.roles.find(r => r.name === "user");
    }

    getAllRoles() {
        return this.roles;
    }
}

console.log("[Roles] Module loaded");
