console.log("[Session] Loading...");

import { DexaStorage } from './storage.js';

export class DexaSession {
    constructor() {
        this.user = DexaStorage.get("dexacore_user", null);
        this.refreshInterval = null;
        this.startTokenRefresh();
        console.log("[Session] Initialized");
    }

    isLoggedIn() {
        return !!this.user;
    }

    setUser(userData) {
        this.user = userData;
        DexaStorage.set("dexacore_user", userData);
        DexaCore.events.emit("auth:login", userData);
        this.startTokenRefresh();
    }

    clear() {
        this.user = null;
        DexaStorage.remove("dexacore_user");
        DexaCore.events.emit("auth:logout");
        this.stopTokenRefresh();
    }

    getUser() {
        return this.user;
    }

    startTokenRefresh() {
        this.stopTokenRefresh();
        
        if (!this.user?.token) return;

        this.refreshInterval = setInterval(async () => {
            await this.refreshTokenIfNeeded();
        }, 5 * 60 * 1000);
    }

    stopTokenRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async refreshTokenIfNeeded() {
        if (!this.user?.token || !DexaCore.supabase?.client) return;

        try {
            const payload = JSON.parse(atob(this.user.token.split('.')[1]));
            const expiresAt = payload.exp * 1000;
            const now = Date.now();

            if (now >= expiresAt - 60000) {
                console.log("[Session] Refreshing token...");
                const { data, error } = await DexaCore.supabase.client.auth.refreshSession();
                
                if (error) throw error;
                
                if (data.session) {
                    this.setUser({
                        ...this.user,
                        token: data.session.access_token
                    });
                    console.log("[Session] Token refreshed successfully");
                }
            }
        } catch (err) {
            console.error("[Session] Token refresh failed:", err);
            if (window.DexaToast) {
                DexaToast.error("Session expired. Please log in again.");
            }
            this.clear();
            if (DexaCore.router) {
                DexaCore.router.go("/login");
            }
        }
    }
}

console.log("[Session] Module loaded");
