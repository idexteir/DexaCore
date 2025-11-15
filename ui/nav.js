window.addEventListener("core:ready", () => {

    function renderNav() {
        const nav = document.querySelector("#navbar");
        if (!nav) return;

        const user = DexaCore.session.getUser();

        if (user) {
            // Logged in navigation
            nav.innerHTML = `
                <div class="nav-left">
                    <a href="#" data-go="home">Home</a>
                    <a href="#" data-go="dashboard">Dashboard</a>
                    <a href="#" data-go="properties">Properties</a>
                    <a href="#" data-go="notes">Notes</a>
                </div>

                <div class="nav-right">
                    <span>${user.email}</span>
                    <button id="logoutBtn">Logout</button>
                </div>
            `;

            document.getElementById("logoutBtn").onclick = () => {
                DexaCore.auth.logout();
            };

        } else {
            // Public navigation
            nav.innerHTML = `
                <div class="nav-left">
                    <a href="#" data-go="home">Home</a>
                </div>

                <div class="nav-right">
                    <button id="loginBtn">Login</button>
                </div>
            `;

            document.getElementById("loginBtn").onclick = () => {
                DexaCore.router.go("/login");
            };
        }

        nav.querySelectorAll("[data-go]").forEach(el => {
            el.onclick = (e) => {
                e.preventDefault();
                DexaCore.router.go(el.dataset.go);
            };
        });
    }

    DexaCore.events.on("page:loaded", () => {
        renderNav();
    });

});
