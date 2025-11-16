console.log("[Auth Callback] Script loading...");

async function processCallback() {
    // ONLY run on auth callback page
    if (window.location.pathname !== '/auth/callback') {
        return;
    }

    try {
        console.log("[Auth Callback] Processing OAuth callback...");
        
        const { data, error } = await DexaCore.supabase.client.auth.getSession();
        
        if (error) throw error;
        if (!data.session) throw new Error("No session found");

        const user = data.session.user;
        
        // Extract role from ALL possible locations
        const role = user.app_metadata?.role || 
                     user.user_metadata?.role || 
                     user.raw_app_meta_data?.role ||
                     user.raw_user_meta_data?.role ||
                     "user";

        const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 
                  user.user_metadata?.full_name || 
                  user.email,
            role: role,  // ← IMPORTANT
            avatar: user.user_metadata?.avatar_url || 
                    user.user_metadata?.picture,
            token: data.session.access_token
        };

        console.log("[Auth Callback] User data with role:", userData);
        
        DexaCore.session.setUser(userData);
        
        console.log("[Auth Callback] Session set, redirecting...");
        DexaCore.router.go("/");
        
    } catch (err) {
        console.error("[Auth Callback] Fatal error:", err);
        if (window.DexaToast) {
            DexaToast.error("Login failed: " + err.message);
        }
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

