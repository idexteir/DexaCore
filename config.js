const config = {
    appName: "DexaCore",
    environment: "development",

    brand: {
        logo: "assets/logo.png",
        primaryColor: "#2563eb"
    },

    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || "",
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
    },

    auth: {
        redirectIfLoggedOut: "/login",
        redirectIfLoggedIn: "/dashboard"
    },

    debug: true
};

// Make globally available
window.DexaCoreConfig = config;

// Also export for ES modules
export default config;
