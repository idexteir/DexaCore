(function waitForDexaCoreNav(cb) {
  if (window.DexaCore && DexaCore.events) {
    cb();
  } else {
    setTimeout(() => waitForDexaCoreNav(cb), 30);
  }
})(function() {
DexaCore.events.on("core:ready", async () => {
    const navContainer = document.querySelector("#dexa-nav");
    console.log("[Nav] Nav container:", navContainer);
    
    if (!navContainer) {
        console.error("[Nav] Nav container #dexa-nav not found!");
        return;
    }

    // Load nav.html template
    try {
        const response = await fetch("/ui/nav.html");
        console.log("[Nav] Fetch response status:", response.status, response.statusText);
        console.log("[Nav] Response URL:", response.url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log("[Nav] Nav HTML loaded, length:", html.length);
        console.log("[Nav] First 100 chars:", html.substring(0, 100));
        
        // Verify it's the correct content
        if (html.includes('<!DOCTYPE html>') || html.includes('<meta charset')) {
            console.error("[Nav] ERROR: Fetched full page instead of nav.html!");
            console.error("[Nav] HTML content:", html.substring(0, 500));
            
            // Fallback: Create nav manually
            navContainer.innerHTML = `
                <nav class="dexa-nav">
                    <div class="nav-container">
                        <div class="nav-left">
                            <span class="nav-brand" id="nav-brand"></span>
                        </div>
                        <div class="nav-center">
                            <div class="nav-links" id="nav-links"></div>
                        </div>
                        <div class="nav-right" id="nav-right"></div>
                        <button class="nav-toggle" id="nav-toggle" onclick="Nav.toggleMenu()">☰</button>
                    </div>
                </nav>
            `;
        } else {
            navContainer.innerHTML = html;
        }
        
        console.log("[Nav] Nav HTML inserted");
    } catch (err) {
        console.error("[Nav] Failed to load nav.html:", err);
        
        // Fallback: Create nav manually
        navContainer.innerHTML = `
            <nav class="dexa-nav">
                <div class="nav-container">
                    <div class="nav-left">
                        <span class="nav-brand" id="nav-brand"></span>
                    </div>
                    <div class="nav-center">
                        <div class="nav-links" id="nav-links"></div>
                    </div>
                    <div class="nav-right" id="nav-right"></div>
                    <button class="nav-toggle" id="nav-toggle" onclick="Nav.toggleMenu()">☰</button>
                </div>
            </nav>
        `;
    }

    // Now initialize navigation
    const brandEl = document.getElementById("nav-brand");
    const linksEl = document.getElementById("nav-links");
    const rightEl = document.getElementById("nav-right");

    console.log("[Nav] Elements found:", { brandEl, linksEl, rightEl });

    const cfg = window.DexaNavConfig;

    if (!cfg) {
        console.error("[Nav] DexaNavConfig not found");
        return;
    }

    /* BRAND CLICK: RETURN HOME */
    if (brandEl) {
        brandEl.textContent = cfg.brand || "DexaCore";
        brandEl.style.cursor = "pointer";
        brandEl.onclick = () => DexaCore.router.go("home");
    }

    // Mobile menu toggle
    window.Nav = {
        toggleMenu() {
            const navCenter = document.querySelector(".nav-center");
            if (navCenter) {
                navCenter.classList.toggle("show");
            }
        }
    };

    // Add mobile toggle functionality
    const navToggle = document.getElementById("nav-toggle");
    const navCenter = document.querySelector(".nav-center");

    if (navToggle && navCenter) {
        navToggle.addEventListener("click", () => {
            navCenter.classList.toggle("show");
        });
    }

    /* RENDER MENU */
    function renderMenu() {
        console.log("[Nav] Rendering menu...");
        
        const user = DexaCore.session?.getUser();
        const isLoggedIn = DexaCore.session?.isLoggedIn() || false;
        
        console.log("[Nav] User:", user, "Logged:", isLoggedIn);

        // Safety check
        if (!linksEl || !rightEl) {
            console.error("[Nav] Nav elements not found");
            return;
        }

        // Clear existing content
        linksEl.innerHTML = "";
        rightEl.innerHTML = "";

        // Build navigation links
        const links = [];
        
        links.push({ label: "Dashboard", href: "/dashboard", icon: "📊" });
        
        if (isLoggedIn) {
            links.push({ label: "Properties", href: "/properties", icon: "🏢" });
            
            // Admin link with null check
            if (user && user.role === "admin") {
                links.push({ label: "Admin", href: "/admin", icon: "⚙️" });
            }
        }

        // Render navigation links
        links.forEach(link => {
            const a = document.createElement("a");
            a.href = link.href;
            a.className = "nav-link";
            a.textContent = `${link.icon || ""} ${link.label}`;
            a.onclick = (e) => {
                e.preventDefault();
                DexaCore.router.go(link.href);
            };
            linksEl.appendChild(a);
        });

        // Right side - user menu or login button
        if (isLoggedIn && user) {
            // User is logged in - show user menu
            const userMenu = document.createElement("div");
            userMenu.className = "nav-user-menu";
            
            // STEP 1: ADD AVATAR OR INITIAL FIRST
            if (user.avatar) {
                const avatar = document.createElement("img");
                avatar.src = user.avatar;
                avatar.alt = user.name;
                avatar.className = "nav-avatar";
                avatar.onerror = function() {
                    // If image fails, replace with initial
                    this.style.display = "none";
                    const initial = document.createElement("div");
                    initial.className = "nav-avatar-initial";
                    initial.textContent = (user.name || user.email).charAt(0).toUpperCase();
                    userMenu.insertBefore(initial, this.nextSibling);
                };
                userMenu.appendChild(avatar); // Avatar FIRST
            } else {
                // Show first letter of name
                const initial = document.createElement("div");
                initial.className = "nav-avatar-initial";
                initial.textContent = (user.name || user.email).charAt(0).toUpperCase();
                userMenu.appendChild(initial); // Initial FIRST
            }
            
            // STEP 2: ADD USERNAME SECOND
            const userName = document.createElement("span");
            userName.className = "nav-username";
            userName.textContent = user.name || user.email;
            userMenu.appendChild(userName); // Username SECOND
            
            // STEP 3: ADD LOGOUT BUTTON THIRD
            const logoutBtn = document.createElement("button");
            logoutBtn.textContent = "Logout";
            logoutBtn.onclick = async () => {
                try {
                    await DexaCore.supabase.client.auth.signOut();
                    localStorage.clear();
                    DexaCore.router.go("/login");
                } catch (err) {
                    console.error("[Nav] Logout error:", err);
                    localStorage.clear();
                    location.href = "/login";
                }
            };
            userMenu.appendChild(logoutBtn); // Logout THIRD
            
            rightEl.appendChild(userMenu);
            
        } else {
            // User not logged in - show login button
            const loginBtn = document.createElement("a");
            loginBtn.href = "/login";
            loginBtn.className = "btn-primary";
            loginBtn.textContent = "Login";
            loginBtn.onclick = (e) => {
                e.preventDefault();
                DexaCore.router.go("/login");
            };
            rightEl.appendChild(loginBtn);
        }
        
        console.log("[Nav] Menu rendered successfully");
    }

    /* SETUP EVENT LISTENERS FIRST (BEFORE INITIAL RENDER) */
    console.log("[Nav] Setting up event listeners...");
    DexaCore.events.on("page:loaded", () => {
        console.log("[Nav] page:loaded event triggered");
        renderMenu();
    });
    DexaCore.events.on("auth:login", (userData) => {
        console.log("[Nav] auth:login event triggered:", userData);
        renderMenu();
    });
    DexaCore.events.on("auth:logout", () => {
        console.log("[Nav] auth:logout event triggered");
        renderMenu();
    });

    // Initial render
    console.log("[Nav] Initial render...");
    renderMenu();
    
    // Force render after delays
    setTimeout(() => {
        console.log("[Nav] Delayed render (100ms)...");
        renderMenu();
    }, 100);
    setTimeout(() => {
        console.log("[Nav] Delayed render (500ms)...");
        renderMenu();
    }, 500);
});
});
