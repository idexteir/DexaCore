class Nav {
    static init() {
        if (!DexaCore.session.isLoggedIn()) return;

        // Inject nav only once
        if (!document.querySelector(".nav-bar")) {
            fetch("ui/nav.html")
                .then(r => r.text())
                .then(html => {
                    const wrapper = document.createElement("div");
                    wrapper.innerHTML = html;
                    document.body.prepend(wrapper);
                    Nav.updateUserEmail();
                    Nav.highlightActive();
                });
        } else {
            Nav.updateUserEmail();
            Nav.highlightActive();
        }
    }

    static updateUserEmail() {
        const user = DexaCore.session.getUser();
        if (user && user.email) {
            const el = document.querySelector("#navUserEmail");
            if (el) el.innerText = user.email;
        }
    }

    static highlightActive() {
        const links = document.querySelectorAll(".nav-links a");
        links.forEach(link => {
            const route = link.getAttribute("data-route");
            link.classList.toggle("active", location.pathname === route);
        });
    }

    static go(path) {
        DexaCore.router.go(path);
        return false;
    }

    static toggleMenu() {
        const menu = document.querySelector(".nav-links");
        if (menu) menu.classList.toggle("show");
    }
}

/* Re-run on every page load */
DexaCore.events.on("page:loaded", () => {
    Nav.init();
});
