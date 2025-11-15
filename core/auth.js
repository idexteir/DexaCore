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

        async loginWithGoogle() {
            DexaLoading.show("Redirecting...");
        
            const { data, error } = await DexaCore.supabase.client.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + "/DexaCore/"
                }
            });
        
            if (error) {
                DexaLoading.hide();
                return DexaToast.error(error.message);
            }
        
            // User will be redirected back from Google
        }
        

        // Google login placeholder (will implement later)
        async loginWithGoogle() {
            console.log("[DexaAuth] Google login clicked");
        }
    }

    

    DexaCore.auth = new DexaAuth();
});
