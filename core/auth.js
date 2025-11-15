DexaCore.events.on("core:ready", () => {
class DexaAuth {
    constructor() {
        this.supabase = DexaSupabase;
    }

    async login(email, password) {
        DexaLoading.show("Signing in...");

        try {
            const user = await this.supabase.signIn(email, password);
            const session = await this.supabase.getSession();

            // Fetch user role from DB
            const users = await DexaCore.supabase.select("users", { id: user.id });
            const userRecord = users[0];

            // Load roles table and map user’s role
            await DexaCore.roles.loadRoles();
            DexaCore.roles.setUserRole(userRecord.role || "user");

            DexaCore.session.setUser({
                id: user.id,
                email: user.email,
                token: session.access_token,
                role: userRecord.role || "user",
                permissions: DexaCore.roles.userPermissions
            });

            DexaLoading.hide();
            DexaToast.success("Welcome!");

            DexaCore.router.go("/dashboard");

        } catch (err) {
            DexaLoading.hide();
            DexaToast.error(err.message);
        }
    }

    logout() {
        DexaCore.session.clear();
        DexaCore.router.go("/login");
    }
}
DexaCore.auth = new DexaAuth();
});
