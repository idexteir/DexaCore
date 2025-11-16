console.log("[Storage] Loading...");

export const DexaStorage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error("[Storage] Set error:", err);
        }
    },

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (err) {
            console.error("[Storage] Get error:", err);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (err) {
            console.error("[Storage] Remove error:", err);
        }
    },

    clear() {
        try {
            localStorage.clear();
        } catch (err) {
            console.error("[Storage] Clear error:", err);
        }
    }
};

console.log("[Storage] Module loaded");

// Also attach to window for non-module scripts
window.DexaStorage = DexaStorage;
