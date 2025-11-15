class DexaRouter {
    constructor() {
        this.routes = {};
        window.addEventListener("popstate", () => this.load(location.pathname));
        this.load(location.pathname);
    }

    async load(path) {
        if (!path || path === "/") path = "/login";

        const page = `modules/${path.replace("/", "")}/${path.replace("/", "")}.page.html`;

        try {
            const html = await fetch(page).then(r => r.text());
            document.querySelector("#app").innerHTML = html;
            DexaCore.events.emit("page:loaded", path);
        } catch (e) {
            document.querySelector("#app").innerHTML = "<h2>404 Not Found</h2>";
        }
    }

    go(path) {
        history.pushState(null, "", path);
        this.load(path);
    }
}
