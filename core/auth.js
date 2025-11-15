DexaCore.events.on("core:ready", () => {

    class DexaAuth {
    
        async loginWithGoogle() {
            await DexaSupabase.client.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + "/DexaCore/"
                }
            });
        }
    
        async logout() {
            await DexaSupabase.client.auth.signOut();
            DexaCore.session.clear();
            DexaCore.events.emit("auth:change", null);
            DexaCore.router.go("login");
        }
    
        async getUser() {
            const { data } = await DexaSupabase.client.auth.getUser();
            return data?.user || null;
        }
    }
    
    DexaCore.auth = new DexaAuth();
    
    });
    