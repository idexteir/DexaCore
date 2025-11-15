window.addEventListener("core:ready", () => {

    class DexaAuth {

        constructor() {
            this.supabase = DexaSupabase;
        }

        async getUser() {
            const { data } = await this.supabase.client.auth.getUser();
            return data?.user || null;
        }

        async logout() {
            await this.supabase.client.auth.signOut();
            DexaCore.session.clear();
            DexaCore.router.go("/login");
        }

        // Google login placeholder (will implement later)
        async loginWithGoogle() {
            console.log("[DexaAuth] Google login clicked");
        }
    }

    DexaCore.auth = new DexaAuth();
});
