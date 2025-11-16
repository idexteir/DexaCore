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

    /* RENDER MENU */
    function renderMenu() {
        console.log("[Nav] Rendering menu...");
        if (!linksEl || !rightEl) {
            console.warn("[Nav] Nav elements not found:", { linksEl, rightEl });
            return;
        }

        const user = DexaCore.session.getUser();
        const logged = DexaCore.session.isLoggedIn();
        const currentPath = location.pathname.replace(/^\//, "") || "home";

        console.log("[Nav] User:", user, "Logged:", logged);

        linksEl.innerHTML = "";

        // Show public links when not logged in, private links when logged in
        const menuItems = [];
        
        if (logged) {
            // User is logged in - show private links
            if (cfg.private) {
                cfg.private.forEach(item => {
                    // Handle logout action
                    if (item.action === "logout") {
                        const a = document.createElement("a");
                        a.textContent = item.label;
                        a.href = "javascript:void(0)";
                        a.onclick = () => DexaAuth.logout();
                        linksEl.appendChild(a);
                        return;
                    }
                    
                    menuItems.push(item);
                });
            }
            
            // Also add admin-specific items if user is admin
            if (user.role === "admin" && cfg.admin) {
                cfg.admin.forEach(item => {
                    if (!menuItems.find(mi => mi.path === item.path)) {
                        menuItems.push(item);
                    }
                });
            }
        } else {
            // User is not logged in - show public links
            if (cfg.public) {
                cfg.public.forEach(item => {
                    menuItems.push(item);
                });
            }
        }

        // Render menu items
        menuItems.forEach(item => {
            if (item.action === "logout") return; // Already handled above
            
            const a = document.createElement("a");
            a.textContent = item.label || item.name || "Link";
            a.href = "javascript:void(0)";
            a.classList.toggle("active", currentPath === item.path);
            a.onclick = () => DexaCore.router.go(item.path);
            linksEl.appendChild(a);
        });

        // Right side: Login button or user menu
        rightEl.innerHTML = "";

        if (!logged) {
            // Show Login button
            const btn = document.createElement("button");
            btn.textContent = "Login";
            btn.className = "btn-login";
            btn.onclick = () => DexaCore.router.go("login");
            rightEl.appendChild(btn);
        } else {
            // Show user avatar/menu
            const userMenu = document.createElement("div");
            userMenu.className = "user-menu";
            
            const userBtn = document.createElement("button");
            userBtn.className = "user-btn";
            
            if (user.avatar) {
                const img = document.createElement("img");
                img.src = user.avatar;
                img.alt = user.name || user.email;
                img.className = "user-avatar-img";
                userBtn.appendChild(img);
            } else {
                userBtn.textContent = (user.name || user.email || "U")[0].toUpperCase();
                userBtn.className = "user-btn user-avatar-text";
            }
            
            const dropdown = document.createElement("div");
            dropdown.className = "user-dropdown";
            dropdown.innerHTML = `
                <div class="dropdown-item dropdown-header">
                    <span>${user.name || user.email}</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item dropdown-action" onclick="DexaAuth.logout()">
                    <span>Logout</span>
                </div>
            `;
            
            userMenu.appendChild(userBtn);
            userMenu.appendChild(dropdown);
            
            userBtn.onclick = (e) => {
                e.stopPropagation();
                dropdown.classList.toggle("show");
            };
            
            document.addEventListener("click", () => {
                dropdown.classList.remove("show");
            });
            
            rightEl.appendChild(userMenu);
        }
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
