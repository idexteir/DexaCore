class DexaPermissions {

    has(perm) {
        return DexaCore.roles.has(perm);
    }

    require(perm) {
        if (!DexaCore.roles.has(perm)) {
            DexaCore.router.go("/403");
            return false;
        }
        return true;
    }

    // Hide any DOM element that has a permission requirement
    applyDOMPermissions() {
        document.querySelectorAll("[data-permission]").forEach(el => {
            const p = el.getAttribute("data-permission");
            if (!this.has(p)) {
                el.style.display = "none";
            }
        });
    }
}

DexaCore.events.on("page:loaded", () => {
    DexaCore.permissions.applyDOMPermissions();
});
