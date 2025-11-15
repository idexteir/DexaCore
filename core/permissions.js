DexaCore.events.on("core:ready", () => {
class DexaPermissions {
    has(perm) { return DexaCore.roles.has(perm); }
    require(perm) {
        if (!DexaCore.roles.has(perm)) {
            DexaCore.router.go("/403");
            return false;
        }
        return true;
    }
    applyDOMPermissions() {
        document.querySelectorAll("[data-permission]").forEach(el => {
            const p = el.getAttribute("data-permission");
            if (!this.has(p)) { el.style.display = "none"; }
        });
    }
}
DexaCore.permissions = new DexaPermissions();
DexaCore.events.on("page:loaded", () => { DexaCore.permissions.applyDOMPermissions(); });
});
