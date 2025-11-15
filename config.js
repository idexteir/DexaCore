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
        url: "https://uscpgbnyziywrgypssxt.supabase.co",
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzY3BnYm55eml5d3JneXBzc3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjY1MTAsImV4cCI6MjA3ODgwMjUxMH0.rToaR0uPGDjcpm7_0mkR543Vn_Yi6i_uysbvNXlSmTA"
    },

    auth: {
        redirectIfLoggedOut: "/login",
        redirectIfLoggedIn: "/dashboard"
    },

    debug: true
};
