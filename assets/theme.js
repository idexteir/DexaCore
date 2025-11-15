class ThemeManager {
    static init() {
        const saved = DexaStorage.get("theme", "light");
        if (saved === "dark") document.documentElement.classList.add("dark");

        const switcher = document.querySelector(".theme-switch");
        if (switcher) {
            switcher.onclick = ThemeManager.toggle;
        }
    }

    static toggle() {
        document.documentElement.classList.toggle("dark");

        const mode = document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";

        DexaStorage.set("theme", mode);
    }
}

DexaCore.events.on("page:loaded", () => ThemeManager.init());
