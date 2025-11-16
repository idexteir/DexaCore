// Wait for both core:ready AND ensure UI components are loaded
function waitForDependencies(callback) {
    const checkInterval = setInterval(() => {
        if (window.DexaCore?.events && 
            window.DexaLoading && 
            window.DexaToast && 
            window.DexaCore.supabase?.client) {
            clearInterval(checkInterval);
            callback();
        }
    }, 50);
}

waitForDependencies(() => {
    DexaCore.events.on("page:loaded", (page) => {
        if (page !== "login") return;

        setTimeout(() => {
            const btn = document.getElementById("google-login-btn");
            if (!btn) {
                console.error("[Login] Button not found");
                return;
            }

            console.log("[Login] Attaching Google login handler");

            btn.onclick = async (e) => {
                e.preventDefault();
                console.log("[Login] Google button clicked");

                DexaLoading.show("Redirecting to Google...");

                try {
                    const { data, error } = await DexaCore.supabase.client.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback`
                        }
                    });

                    if (error) {
                        console.error("[Login] OAuth error:", error);
                        DexaLoading.hide();
                        DexaToast.error("Login failed: " + error.message);
                    }
                } catch (err) {
                    console.error("[Login] Exception:", err);
                    DexaLoading.hide();
                    DexaToast.error("Login error: " + err.message);
                }
            };

            console.log("[Login] Handler attached successfully");
        }, 100);
    });
});