class DexaPermissions {
    constructor() {
        this.current = [];
    }

    load(role) {
        if (!DexaCore.roles) return;
        this.current = DexaCore.roles.getPermissions(role) || [];
    }

    has(perm) {
        return this.current.includes(perm);
    }
}

window.DexaPermissions = DexaPermissions;
