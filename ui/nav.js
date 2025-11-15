/* -----------------------------------------------------------
   NAVIGATION BAR LOGIC
----------------------------------------------------------- */

DexaCore.events.on("core:ready", () => {
    renderNav();
});

/**
 * Builds navigation UI depending on login status
 */
function renderNav() {

    const isLogged = DexaCore.session.isLoggedIn();
    const user = DexaCore.session.getUser();

    const nav = `
        <nav id="navBar">

            <a class="nav-logo" href="#" data-go="home">DexaCore</a>

            <div class="nav-links">
                <a data-go="home">Home</a>
                <a data-go="dashboard">Dashboard</a>
                <a data-go="properties">Properties</a>
                <a data-go="notes">Notes</a>
            </div>

            <div>
                ${isLogged
                    ? `<button class="nav-auth-btn logout" id="logoutBtn">Logout</button>`
                    : `<button class="nav-auth-btn" id="loginBtn">Login</button>`
                }
            </div>

        </nav>
    `;

    document.body.insertAdjacentHTML("afterbegin", nav);

    // Bind link routing
    document.querySelectorAll("[data-go]").forEach(a => {
        a.onclick = () => DexaCore.router.go(a.dataset.go);
    });

    // Bind login
    if (!isLogged) {
        document.getElementById("loginBtn").onclick = () => {
            DexaCore.router.go("/login");
        };
    }

    // Bind logout
    if (isLogged) {
        document.getElementById("logoutBtn").onclick = () => {
            DexaCore.auth.logout();
        };
    }
}
