// core/router.js
class DexaRouter {

    constructor() {
        this.BASE = "/DexaCore/";

        window.addEventListener("popstate", () => this.handle(location.pathname));

        this.handle(location.pathname);
    }

    normalize(path) {
        if (path.startsWith(this.BASE))
            path = path.slice(this.BASE.length);

        path = path.split("?")[0];

        if (path.startsWith("/"))
            path = path.slice(1);

        if (!path) return "home";

        return path;
    }

    async handle(rawPath) {
        const page = this.normalize(rawPath);
        const pageUrl = `${this.BASE}modules/${page}/${page}.page.html`;

        try {
            // Render page
            const html = await fetch(pageUrl).then(r => r.text());
            document.querySelector("#app").innerHTML = `
                <div id="nav"></div>
                ${html}
            `;

            // Notify core
            DexaCore.events.emit("page:loaded", page);

        } catch (err) {
            document.querySelector("#app").innerHTML = "<h2>404 Page Not Found</h2>";
        }
    }

    go(path) {
        path = path.replace(/^\//, "");
        history.pushState(null, "", this.BASE + path);
        this.handle(path);
    }
}

window.DexaRouter = DexaRouter;
