// ui/nav.js
DexaCore.events.on("core:ready", () => {

    function buildNavLinks() {
        const navItems = [];

        // Always add public links
        DexaNavConfig.public.forEach(item => navItems.push(item));

        // Add role-based items
        if (DexaCore.session.isLoggedIn()) {
            const role = DexaCore.session.getUser().role;

            if (DexaNavConfig[role]) {
                DexaNavConfig[role].forEach(item => navItems.push(item));
            }
        }

        return navItems;
    }

    function renderNav() {
        const nav = document.querySelector("#nav");
        if (!nav) return;

        const items = buildNavLinks();

        nav.innerHTML = `
            <div class="nav-container">
                <a class="nav-logo" onclick="DexaCore.router.go('/home')">DexaCore</a>
                <div class="nav-links">
                    ${items.map(i => `
                        <a onclick="DexaCore.router.go('${i.path}')">${i.label}</a>
                    `).join("")}

                    ${DexaCore.session.isLoggedIn()
                        ? `<a onclick="DexaCore.auth.logout()">Logout</a>`
                        : ""
                    }
                </div>
            </div>
        `;
    }

    DexaCore.events.on("page:loaded", renderNav);
});
