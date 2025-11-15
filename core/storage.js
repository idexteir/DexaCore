class DexaStorage {
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static get(key, fallback = null) {
        const item = localStorage.getItem(key);
        if (!item) return fallback;

        try {
            return JSON.parse(item);
        } catch {
            return fallback;
        }
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}
