class DexaRouter {
    constructor() {

        // Detect GitHub Pages base path automatically
        this.BASE = "/DexaCore/";  // your repo name

        window.addEventListener("popstate", () => this.handle(location.pathname));
        this.handle(location.pathname);
    }

    normalize(path) {
        // Remove base (/DexaCore/)
        if (path.startsWith(this.BASE)) {
            path = path.substring(this.BASE.length);
        }

        // Default redirect
        if (path === "" || path === "/") return "login";

        // Remove leading slash
        return path.replace("/", "");
    }

    async handle(path) {
        const page = this.normalize(path);

        const pageUrl = `${this.BASE}modules/${page}/${page}.page.html`;

        try {
            const html = await fetch(pageUrl).then(r => r.text());
            document.querySelector("#app").innerHTML = html;

            // Notify DexaCore that page finished loading
            DexaCore.events.emit("page:loaded", page);

        } catch (e) {
            document.querySelector("#app").innerHTML = "<h2>404 Not Found</h2>";
        }
    }

    go(path) {
        // Always push with base
        history.pushState(null, "", this.BASE + path);
        this.handle(path);
    }
}
