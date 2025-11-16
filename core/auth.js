console.log("[Auth] Loading...");

// Make DexaAuth available globally
window.DexaAuth = {
    async login(email, password) {
        try {
            const { data, error } = await DexaCore.supabase.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            const userData = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.email,
                role: "user",
                token: data.session.access_token
            };

            DexaCore.session.setUser(userData);
            return { success: true, user: userData };
        } catch (err) {
            console.error("[Auth] Login error:", err);
            return { success: false, error: err.message };
        }
    },

    async logout() {
        try {
            await DexaCore.supabase.client.auth.signOut();
            DexaCore.session.clear();
            if (DexaCore.router) {
                DexaCore.router.go("/login");
            }
        } catch (err) {
            console.error("[Auth] Logout error:", err);
            // Force logout even if Supabase fails
            DexaCore.session.clear();
            if (DexaCore.router) {
                DexaCore.router.go("/login");
            }
        }
    },

    async register(email, password, name) {
        try {
            const { data, error } = await DexaCore.supabase.client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (err) {
            console.error("[Auth] Register error:", err);
            return { success: false, error: err.message };
        }
    },

    async resetPassword(email) {
        try {
            const { error } = await DexaCore.supabase.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            return { success: true };
        } catch (err) {
            console.error("[Auth] Reset password error:", err);
            return { success: false, error: err.message };
        }
    }
};

console.log("[Auth] Initialized");
