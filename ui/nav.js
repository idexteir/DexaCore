document.addEventListener("DOMContentLoaded", async () => {

    const navContainer = document.createElement("nav");
    navContainer.classList.add("nav-bar");
    document.body.prepend(navContainer);

    async function renderNav() {

        const user = await DexaCore.auth.getUser();

        navContainer.innerHTML = "";

        let links = [];

        if (!user) {
            links = DexaNavConfig.publicLinks;
        } else {
            links = [...DexaNavConfig.privateLinks];

            if (DexaCore.roles.is("admin")) {
                links = [...links, ...DexaNavConfig.adminLinks];
            }
        }

        for (const link of links) {
            const a = document.createElement("a");
            a.textContent = link.label;

            if (link.page === "logout") {
                a.onclick = (e) => {
                    e.preventDefault();
                    DexaCore.auth.logout();
                };
            } else {
                a.onclick = (e) => {
                    e.preventDefault();
                    DexaCore.router.go(link.page);
                };
            }

            navContainer.appendChild(a);
        }
    }

    DexaCore.events.on("core:ready", renderNav);
    DexaCore.events.on("auth:change", renderNav);
    DexaCore.events.on("page:loaded", renderNav);
});
