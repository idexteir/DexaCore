// Prevent running before DexaCore loads
document.addEventListener("DOMContentLoaded", () => {

    const waitForDexaCore = setInterval(() => {
        if (window.DexaCore && DexaCore.events && window.DexaNavConfig) {
            clearInterval(waitForDexaCore);
            initNavigation();
        }
    }, 50);

});

function initNavigation() {

    // Render navigation after ANY page load
    DexaCore.events.on("page:loaded", () => {
        renderNav();
    });

    renderNav();
}

async function renderNav() {
    const navArea = document.querySelector("body");

    // Load nav HTML once
    if (!document.querySelector(".dexa-nav")) {
        const html = await fetch("/ui/nav.html").then(r => r.text());
        navArea.insertAdjacentHTML("afterbegin", html);
    }

    const brand = document.getElementById("nav-brand");
    const links = document.getElementById("nav-links");
    const right = document.getElementById("nav-right");

    brand.textContent = DexaNavConfig.brand;

    const user = DexaCore.session.getUser();

    // Render links
    links.innerHTML = "";

    DexaNavConfig.items.forEach(item => {
        if (item.public || (item.auth && user)) {
            const a = document.createElement("a");
            a.textContent = item.label;
            a.href = item.path;
            a.onclick = (e) => {
                e.preventDefault();
                DexaCore.router.go(item.path);
            };
            links.appendChild(a);
        }
    });

    // Right side (login/logout)
    right.innerHTML = "";

    if (user) {
        const logout = document.createElement("button");
        logout.textContent = "Logout";
        logout.onclick = () => DexaCore.auth.logout();
        right.appendChild(logout);
    }
}
