console.log("[Auth Callback] Script loading...");

async function processCallback() {
    // ONLY run on auth callback page
    if (window.location.pathname !== '/auth/callback') {
        return;
    }

    console.log("[Auth Callback] Processing OAuth callback...");

    // Wait for DexaCore
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!window.DexaCore?.router && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.DexaCore?.router) {
        console.error("[Auth Callback] DexaCore not ready after 10 seconds");
        document.querySelector("#app").innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h1>Authentication Error</h1>
                <p>System initialization failed</p>
                <a href="/" class="btn-primary">Go Home</a>
            </div>
        `;
        return;
    }

    try {
        const { data: { session }, error } = await DexaCore.supabase.client.auth.getSession();

        if (error) {
            console.error("[Auth Callback] Session error:", error);
            if (window.DexaToast) DexaToast.error("Authentication failed");
            DexaCore.router.go("/login");
            return;
        }

        if (!session) {
            console.warn("[Auth Callback] No session found");
            DexaCore.router.go("/login");
            return;
        }

        console.log("[Auth Callback] Session found:", session.user.email);

        const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            role: "user",
            token: session.access_token
        };

        DexaCore.session.setUser(userData);
        console.log("[Auth Callback] User authenticated:", userData.email);
        
        DexaCore.router.go(window.DexaCoreConfig?.auth?.redirectIfLoggedIn || "/dashboard");

    } catch (err) {
        console.error("[Auth Callback] Fatal error:", err);
        if (window.DexaToast) DexaToast.error("Authentication failed");
        DexaCore.router.go("/login");
    }
}

// Only execute when on callback page
if (window.location.pathname === '/auth/callback') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("[Auth Callback] Starting callback processing...");
            setTimeout(processCallback, 500);
        });
    } else {
        console.log("[Auth Callback] Starting callback processing...");
        setTimeout(processCallback, 500);
    }
}

