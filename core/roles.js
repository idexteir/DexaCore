class DexaRoles {
    constructor() {
        this.roles = {};        // full role → permission mapping
        this.userRole = null;   // user’s role
        this.userPermissions = [];
    }

    // Load roles from database
    async loadRoles() {
        try {
            const data = await DexaCore.supabase.select("roles");
            data.forEach(r => {
                this.roles[r.name] = r.permissions || [];
            });
        } catch (e) {
            console.warn("Roles DB not found. Using fallback roles.");
            this.roles = {
                admin: ["*"],
                manager: [],
                editor: [],
                user: []
            };
        }
    }

    // Called after user logs in
    setUserRole(roleName) {
        this.userRole = roleName;
        this.userPermissions = this.roles[roleName] || [];
    }

    has(perm) {
        if (!this.userRole) return false;

        // Admin wildcard
        if (this.userPermissions.includes("*")) return true;

        return this.userPermissions.includes(perm);
    }

    require(perm) {
        if (!this.has(perm)) {
            DexaCore.router.go("/403");
            return false;
        }
        return true;
    }
}
