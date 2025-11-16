class DexaRouter {
    constructor() {
        this.BASE = "/"; // Root since Netlify serves from /
        window.addEventListener("popstate", () => this.handle(location.pathname));
        this.handle(location.pathname);
    }

    normalize(path) {
        // Remove query params
        path = path.split("?")[0];

        // Remove leading slash
        path = path.replace(/^\//, "");

        // Default page
        if (path === "") return "home";

        return path;
    }

    async handle(path) {
        const page = this.normalize(path);

        const pageUrl = `modules/${page}/${page}.page.html`;

        try {
            const html = await fetch(pageUrl).then(r => {
                if (!r.ok) throw new Error("Page not found");
                return r.text();
            });

            document.querySelector("#app").innerHTML = html;

            // Fire page loaded event
            DexaCore.events.emit("page:loaded", page);

            // Public pages:
            const isPublic = ["home", "login", "register"].includes(page);

            if (!isPublic) {
                if (!DexaCore.session.isLoggedIn()) {
                    return this.go("login");
                }
            }

        } catch (e) {
            document.querySelector("#app").innerHTML = "<h2>404 Not Found</h2>";
        }
    }

    go(path) {
        path = path.replace(/^\//, ""); // Remove leading slash

        history.pushState(null, "", "/" + path);
        this.handle(path);
    }
}
