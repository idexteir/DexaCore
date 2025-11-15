window.DexaCoreConfig = {
    appName: "DexaCore",

    environment: "development", // production

    supabase: {
        url: "",
        anonKey: ""
    },

    auth: {
        redirectIfLoggedOut: "/?login",
        redirectIfLoggedIn: "/dashboard"
    },

    debug: true,
};
window.DexaCoreConfig = {

    appName: "DexaCore",
    environment: "development",

    brand: {
        logo: "assets/logo.png",
        primaryColor: "#2563eb"
    },

    supabase: {
        url: "YOUR_SUPABASE_URL",
        anonKey: "YOUR_SUPABASE_ANON_KEY"
    },

    auth: {
        redirectIfLoggedOut: "/login",
        redirectIfLoggedIn: "/dashboard"
    },

    debug: true
};
