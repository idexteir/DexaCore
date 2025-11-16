console.log("[Permissions] Loading...");

export class DexaPermissions {
    constructor() {
        this.permissions = {};
        console.log("[Permissions] Initialized");
    }

    can(permission) {
        const user = DexaCore.session?.getUser();
        if (!user) return false;

        const userRole = DexaCore.roles?.getUserRole();
        if (!userRole) return false;

        if (userRole.permissions.includes("*")) return true;
        return userRole.permissions.includes(permission);
    }

    setPermissions(permissions) {
        this.permissions = permissions;
    }

    getPermissions() {
        return this.permissions;
    }
}

console.log("[Permissions] Module loaded");
