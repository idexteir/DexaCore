class DashboardPage {

    static init() {
        // Require login
        if (!DexaCore.session.isLoggedIn()) {
            DexaCore.router.go("/login");
            return;
        }

        const user = DexaCore.session.getUser();

        document.querySelector("#dashUserEmail").innerText = user.email || "User";
    }
}

DexaCore.events.on("page:loaded", (path) => {
    if (path === "/dashboard") DashboardPage.init();
});
