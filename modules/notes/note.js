/* --------------------------------------------------------
    Register Entity
-------------------------------------------------------- */

DexaCore.events.on("core:ready", () => {
Entities.register("Note", {
    title: "Notes",
    table: "notes",
    storageKey: "notes",
    fields: {
        title: { required: true, label: "Title" },
        content: { required: true, label: "Content" }
    },
    permissions: {},
    useDB: true
});


/* --------------------------------------------------------
    Notes Module Page Logic
-------------------------------------------------------- */

class NotesPage {

    static init() {
        NotesPage.loadList();

        // Bind form submit
        document.querySelector("#noteForm").onsubmit = async (e) => {
            e.preventDefault();

            const values = DexaForm.getValues("#noteForm");

            const error = DexaForm.validate({
                title: { required: true, label: "Title" },
                content: { required: true, label: "Content" }
            }, values);

            if (error) return DexaToast.error(error);

            await Entities.save("Note", values);

            DexaToast.success("Saved!");
            NotesPage.closeForm();
            NotesPage.loadList();
        };
    }


    /* --------------------------------------------------------
        OPEN/CLOSE FORM
    -------------------------------------------------------- */

    static openForm(note = null) {
        const modal = document.querySelector("#noteModal");
        const title = document.querySelector("#modalTitle");
        const form = document.querySelector("#noteForm");

        modal.classList.remove("hidden");

        // Reset
        form.reset();
        form.id.value = "";

        if (note) {
            // Edit mode
            title.textContent = "Edit Note";
            form.id.value = note.id;
            form.title.value = note.title;
            form.content.value = note.content;
        } else {
            title.textContent = "Add Note";
        }
    }

    static closeForm() {
        document.querySelector("#noteModal").classList.add("hidden");
    }


    /* --------------------------------------------------------
        LIST & DELETE
    -------------------------------------------------------- */

    static async loadList() {
        const list = await Entities.list("Note");
        const container = document.querySelector("#notesList");

        container.innerHTML = "";

        if (list.length === 0) {
            container.innerHTML = "<p class='empty'>No notes yet.</p>";
            return;
        }

        list.forEach(n => {
            const row = document.createElement("div");
            row.className = "note-row";

            row.innerHTML = `
                <div class="note-info">
                    <h4>${n.title}</h4>
                    <p>${n.content}</p>
                </div>

                <div class="note-actions">
                    <button class="btn-small" onclick="NotesPage.openForm(${JSON.stringify(n)})">Edit</button>
                    <button class="btn-delete" onclick="NotesPage.delete('${n.id}')">Delete</button>
                </div>
            `;

            container.appendChild(row);
        });
    }

    static async delete(id) {
        DexaModal.show({
            title: "Delete Note?",
            content: "This action cannot be undone.",
            confirmText: "Delete",
            onConfirm: async () => {
                await Entities.delete("Note", id);
                DexaToast.success("Deleted!");
                NotesPage.loadList();
            }
        });
    }
}


/* Auto-init when page loaded */
DexaCore.events.on("page:loaded", (path) => {
    if (path === "/notes") NotesPage.init();
});
});
