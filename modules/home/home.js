window.addEventListener("core:ready", () => {

    DexaCore.events.on("page:loaded", (page) => { 
        if (page !== "home") return;

    });

});
