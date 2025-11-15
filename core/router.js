class DexaRouter {
    constructor() {

        // Adjust if repo name changes
        this.BASE = "/DexaCore/";

        // Bind browser navigation
        window.addEventListener("popstate", () => this.handle(location.pathname));

        // First load
        this.handle(location.pathname);
    }

    normalize(path) {
        // Remove base folder (GitHub Pages)
        if (path.startsWith(this.BASE)) {
            path = path.substring(this.BASE.length);
        }

        // Strip query string
        path = path.split("?")[0];

        // Remove leading slash
        path = path.replace(/^\//, "");

        // Default landing page
        if (path === "") return "dashboard";

        return path;
    }

    async handle(path) {
        const page = this.normalize(path);

        // Path to .page.html
        const pageUrl = `${this.BASE}modules/${page}/${page}.page.html`;

        try {
            const html = await fetch(pageUrl).then(r => {
                if (!r.ok) throw new Error("Not found");
                return r.text();
            });

            document.querySelector("#app").innerHTML = html;

            // Notify the app
            if (window.DexaCore?.events) {
                DexaCore.events.emit("page:loaded", page);
            }

        } catch (e) {
            document.querySelector("#app").innerHTML = "<h2>404 Not Found</h2>";
        }
    }

    go(path) {
        // Strip leading slash (avoid //)
        path = path.replace(/^\//, "");

        history.pushState(null, "", this.BASE + path);
        this.handle(path);
    }
}
