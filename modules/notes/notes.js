window.addEventListener("core:ready", () => {

    Entities.register("Note", {
        title: "Notes",
        table: "notes",
        storageKey: "notes",
        useDB: true,
        fields: {
            title: { required: true, label: "Title", type: "text" },
            content: { required: true, label: "Content", type: "textarea", rows: 6 },
            color: {
                label: "Color Tag",
                type: "select",
                options: [
                    { value: "blue", label: "Blue" },
                    { value: "green", label: "Green" },
                    { value: "yellow", label: "Yellow" },
                    { value: "purple", label: "Purple" },
                    { value: "red", label: "Red" }
                ]
            }
        }
    });

    DexaCore.events.on("page:loaded", async (page) => {
        if (page !== "notes") return;

        // Load CRUD template
        try {
            const crudHtml = await fetch("ui/crud/crud.page.html").then(r => r.text());
            const crudFormHtml = await fetch("ui/crud/crud.form.html").then(r => r.text());
            
            const container = document.querySelector("#notes-crud");
            if (container) {
                container.innerHTML = crudHtml + crudFormHtml;
                // Initialize CRUD
                await Crud.init("Note");
            }
        } catch (err) {
            console.error("[Notes] Failed to load CRUD:", err);
            DexaToast.error("Failed to load notes interface");
        }
    });

});
