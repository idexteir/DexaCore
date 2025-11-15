class DexaRouter {
    constructor() {

        // Repo base (works for GitHub Pages)
        this.BASE = "/DexaCore/";

        // Define which pages are public
        this.PUBLIC_PAGES = ["", "home", "login"];

        // Listen to browser navigation
        window.addEventListener("popstate", () => this.handle(location.pathname));

        // First load
        this.handle(location.pathname);
    }

    normalize(path) {
        // Remove repo base
        if (path.startsWith(this.BASE)) {
            path = path.substring(this.BASE.length);
        }

        // Remove query parameters
        path = path.split("?")[0];

        // Remove leading slash
        path = path.replace(/^\//, "");

        // Default page = HOME
        if (path === "") return "home";

        return path;
    }

    async handle(path) {
        const page = this.normalize(path);

        // 1️⃣ AUTH CHECK BEFORE LOADING PAGE
        if (!this.PUBLIC_PAGES.includes(page)) {
            const user = await DexaCore.auth.getUser();
            if (!user) {
                return this.go("login");
            }
        }

        // 2️⃣ LOAD PAGE FILE
        const pageUrl = `${this.BASE}modules/${page}/${page}.page.html`;

        try {
            const html = await fetch(pageUrl).then(r => {
                if (!r.ok) throw new Error("Not found");
                return r.text();
            });

            // Inject into app container
            document.querySelector("#app").innerHTML = html;

            // Notify components
            DexaCore.events.emit("page:loaded", page);

        } catch (e) {
            document.querySelector("#app").innerHTML = "<h2>404 Not Found</h2>";
        }
    }

    go(path) {
        // Clean slashes
        path = path.replace(/^\//, "");

        history.pushState(null, "", this.BASE + path);
        this.handle(path);
    }
}
