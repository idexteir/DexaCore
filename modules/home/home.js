window.addEventListener("core:ready", () => {

    DexaCore.events.on("page:loaded", (page) => { 
        if (page !== "home") return;

        document.querySelectorAll("[data-go]").forEach(btn => {
            btn.onclick = () => DexaCore.router.go(btn.dataset.go);
        });
    });

});
