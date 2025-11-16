console.log("[Router] Loading...");

export class DexaRouter {
    constructor() {
        this.currentPage = null;
        this.currentEntityId = null;
        this.isNavigating = false;
        
        window.addEventListener("popstate", () => this.handleRoute());
        
        document.addEventListener("click", (e) => {
            if (e.target.tagName === "A" && e.target.getAttribute("href")?.startsWith("/")) {
                e.preventDefault();
                this.go(e.target.getAttribute("href"));
            }
        });
        
        console.log("[Router] Initialized");
    }

    go(path) {
        if (this.isNavigating) return;
        
        this.isNavigating = true;
        window.history.pushState({}, "", path);
        this.handleRoute().finally(() => {
            this.isNavigating = false;
        });
    }

    async handleRoute() {
        const path = window.location.pathname;
        console.log("[Router] Navigating to:", path);

        const user = DexaCore.session?.getUser();
        const isLoggedIn = !!user;

        if (path === "/" || path === "/home") {
            await this.loadPage("home");
            return;
        }

        if (path === "/login") {
            if (isLoggedIn) {
                this.go(DexaCoreConfig.auth.redirectIfLoggedIn);
                return;
            }
            await this.loadPage("login");
            return;
        }

        if (path === "/register") {
            if (isLoggedIn) {
                this.go(DexaCoreConfig.auth.redirectIfLoggedIn);
                return;
            }
            await this.loadPage("register");
            return;
        }

        if (path === "/auth/callback") {
            await this.loadPage("auth_callback");
            return;
        }

        if (!isLoggedIn) {
            this.go(DexaCoreConfig.auth.redirectIfLoggedOut);
            return;
        }

        if (path === "/dashboard") {
            await this.loadPage("dashboard");
            return;
        }

        if (path === "/properties") {
            await this.loadPage("properties");
            return;
        }

        if (path === "/notes") {
            await this.loadPage("notes");
            return;
        }

        if (path === "/admin") {
            if (user?.role !== "admin") {
                await this.loadPage("403");
                return;
            }
            await this.loadPage("admin");
            return;
        }

        await this.loadPage("404");
    }

    async loadPage(pageName) {
        try {
            this.currentPage = pageName;
            
            const response = await fetch(`modules/${pageName}/${pageName}.page.html`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            document.querySelector("#app").innerHTML = html;
            
            DexaCore.events.emit("page:loaded", pageName);
            console.log(`[Router] Loaded: ${pageName}`);
        } catch (err) {
            console.error(`[Router] Failed to load ${pageName}:`, err);
            document.querySelector("#app").innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <h1>Page Not Found</h1>
                    <p>Could not load page: ${pageName}</p>
                    <a href="/" class="btn-primary">Go Home</a>
                </div>
            `;
        }
    }
}
