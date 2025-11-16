window.addEventListener("core:ready", () => {

    DexaCore.events.on("page:loaded", (page) => {
        if (page !== "dashboard") return;

        console.log("[Dashboard] Page loaded");

        const user = DexaCore.session.getUser();
        const emailEl = document.querySelector("#dashUserEmail");
        const nameEl = document.querySelector("#dashUserName");
        
        if (emailEl) {
            emailEl.textContent = user?.email ?? "User";
        }
        
        if (nameEl) {
            nameEl.textContent = user?.name || user?.email || "User";
        }

        // Show/hide admin cards based on role
        const isAdmin = user?.role === "admin";
        const adminCard = document.getElementById("admin-card");
        const adminModuleCard = document.getElementById("admin-module-card");
        
        if (adminCard) adminCard.style.display = isAdmin ? "block" : "none";
        if (adminModuleCard) adminModuleCard.style.display = isAdmin ? "block" : "none";

        // Load recent activity
        loadRecentActivity();

        // Setup logout button
        setTimeout(() => {
            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.onclick = async () => {
                    if (window.DexaAuth) {
                        await DexaAuth.logout();
                    } else {
                        console.error("[Dashboard] DexaAuth not available");
                        alert("Logout failed - please refresh the page");
                    }
                };
                console.log("[Dashboard] Logout button attached");
            }
        }, 100);
    });

    async function loadRecentActivity() {
        const activityList = document.getElementById("activityList");
        if (!activityList || !window.Entities) return;

        try {
            const [properties, notes] = await Promise.all([
                window.Entities.list("Property").catch(() => []),
                window.Entities.list("Note").catch(() => [])
            ]);

            const activities = [];
            
            // Get recent properties
            properties.slice(0, 3).forEach(p => {
                activities.push({
                    type: "property",
                    text: `Property "${p.title}" was ${p.id ? "updated" : "created"}`,
                    time: "Recently"
                });
            });

            // Get recent notes
            notes.slice(0, 3).forEach(n => {
                activities.push({
                    type: "note",
                    text: `Note "${n.title}" was ${n.id ? "updated" : "created"}`,
                    time: "Recently"
                });
            });

            if (activities.length === 0) {
                activityList.innerHTML = "<p class='empty'>No recent activity</p>";
                return;
            }

            activityList.innerHTML = activities.map(act => `
                <div class="activity-item">
                    <span class="activity-icon">${act.type === "property" ? "🏠" : "📝"}</span>
                    <div class="activity-content">
                        <p>${act.text}</p>
                        <span class="activity-time">${act.time}</span>
                    </div>
                </div>
            `).join("");
        } catch (err) {
            console.error("Failed to load activity:", err);
        }
    }

});
