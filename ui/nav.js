DexaCore.events.on("core:ready", () => {

    const brandEl = document.getElementById("nav-brand");
    const linksEl = document.getElementById("nav-links");
    const rightEl = document.getElementById("nav-right");

    const cfg = window.DexaNavConfig;

    /* BRAND CLICK: RETURN HOME */
    brandEl.onclick = () => DexaCore.router.go("home");

    /* RENDER MENU */
    function renderMenu() {
        const user = DexaCore.session.getUser();
        const logged = !!user;

        linksEl.innerHTML = "";

        const list = logged ? [...cfg.public, ...cfg.private] : cfg.public;

        list.forEach(item => {
            const a = document.createElement("a");
            a.textContent = item.name;
            a.href = "javascript:void(0)";
            a.onclick = () => DexaCore.router.go(item.path);
            linksEl.appendChild(a);
        });

        rightEl.innerHTML = "";

        if (!logged && cfg.auth.login) {
            const btn = document.createElement("button");
            btn.textContent = "Login";
            btn.className = "btn-login";
            btn.onclick = () => DexaCore.router.go("login");
            rightEl.appendChild(btn);
        }

        if (logged && cfg.auth.logout) {
            const btn = document.createElement("button");
            btn.textContent = "Logout";
            btn.className = "btn-logout";
            btn.onclick = () => DexaCore.auth.logout();
            rightEl.appendChild(btn);
        }
    }

    /* UPDATE NAV WHEN PAGES CHANGE */
    DexaCore.events.on("page:loaded", renderMenu);

    renderMenu();
});
