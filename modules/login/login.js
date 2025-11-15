DexaCore.events.on("page:loaded", (page) => {
    if (page !== "login") return;

    const btn = document.getElementById("google-login");

    if (btn) {
        btn.onclick = () => {
            DexaCore.auth.loginWithGoogle();
        };
    }
});
