class DexaSession {
    constructor() {
        this.user = DexaStorage.get("dexacore_user", null);
    }

    isLoggedIn() {
        return !!this.user;
    }

    setUser(userData) {
        this.user = userData;
        DexaStorage.set("dexacore_user", userData);
        DexaCore.events.emit("auth:login", userData);
    }

    clear() {
        this.user = null;
        DexaStorage.remove("dexacore_user");
        DexaCore.events.emit("auth:logout");
    }

    getUser() {
        return this.user;
    }
}
