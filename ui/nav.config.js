window.DexaNavConfig = {
    brand: "DexaCore",
    
    public: [
        { path: "home", label: "Home" },
        { path: "login", label: "Login" }
    ],
    
    private: [
        { path: "dashboard", label: "Dashboard" },
        { path: "properties", label: "Properties" }
        // REMOVED: notes and logout
    ],
    
    admin: [
        { path: "dashboard", label: "Dashboard" },
        { path: "properties", label: "Properties" },
        { path: "admin", label: "Admin Panel" }
        // REMOVED: notes and logout
    ]
};
