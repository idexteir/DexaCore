console.log("[Router] Loading...");

export class DexaRouter {
    constructor() {
        this.currentPage = null;
        this.currentModule = null;
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

        // Public routes
        if (path === "/" || path === "/home") {
            await this.loadModule("home");
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

        // Protected routes
        if (!isLoggedIn) {
            this.go(DexaCoreConfig.auth.redirectIfLoggedOut);
            return;
        }

        if (path === "/dashboard") {
            await this.loadPage("dashboard");
            return;
        }

        if (path === "/properties" || path.startsWith("/properties?")) {
            await this.loadModule("properties");
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

        // 404
        await this.loadPage("404");
    }

    // Load page from HTML file (old style)
    async loadPage(pageName) {
        try {
            this.currentPage = pageName;
            
            const response = await fetch(`modules/${pageName}/${pageName}.page.html`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            document.querySelector("#app").innerHTML = html;
            
            DexaCore.events.emit("page:loaded", pageName);
            console.log(`[Router] Loaded page: ${pageName}`);
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

    // Load module with render() function (new style)
    async loadModule(moduleName) {
        try {
            console.log(`[Router] Loading module: ${moduleName}`);
            
            this.currentPage = moduleName;
            
            // Import the module
            const module = await import(`../modules/${moduleName}/${moduleName}.js`);
            
            if (!module.render || typeof module.render !== 'function') {
                console.error(`[Router] Module ${moduleName} has no render function`);
                throw new Error(`Module ${moduleName} missing render function`);
            }
            
            // Get the container
            const container = document.querySelector("#app");
            if (!container) {
                console.error("[Router] #app container not found!");
                throw new Error("App container not found");
            }
            
            console.log(`[Router] Calling ${moduleName}.render()`);
            
            // Call the render function
            await module.render(container);
            
            // Store module reference
            this.currentModule = module;
            
            DexaCore.events.emit("page:loaded", moduleName);
            console.log(`[Router] Loaded module: ${moduleName}`);
            
        } catch (err) {
            console.error(`[Router] Failed to load module ${moduleName}:`, err);
            console.error("[Router] Error stack:", err.stack);
            
            document.querySelector("#app").innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <h1>Failed to Load ${moduleName}</h1>
                    <p>${err.message}</p>
                    <button class="btn-primary" onclick="location.reload()">Reload</button>
                    <a href="/" class="btn-secondary" style="margin-left: 10px;">Go Home</a>
                </div>
            `;
        }
    }
}


