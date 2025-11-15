window.addEventListener("core:ready", () => {

    /* Register entity */
    Entities.register("Note", {
        title: "Notes",
        table: "notes",
        storageKey: "notes",
        useDB: true,
        fields: {
            title: { required: true, label: "Title" },
            content: { required: true, label: "Content" }
        }
    });


    /* Page Logic */
    class NotesPage {

        static init() {
            NotesPage.loadList();

            const form = document.querySelector("#noteForm");
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();

                    const values = DexaForm.getValues("#noteForm");

                    const error = DexaForm.validate({
                        title: { required: true },
                        content: { required: true }
                    }, values);

                    if (error) return DexaToast.error(error);

                    await Entities.save("Note", values);

                    DexaToast.success("Saved!");
                    NotesPage.closeForm();
                    NotesPage.loadList();
                };
            }
        }

        static openForm(note = null) {
            const modal = document.querySelector("#noteModal");
            const form = document.querySelector("#noteForm");
            const titleEl = document.querySelector("#modalTitle");

            modal.classList.remove("hidden");
            form.reset();
            form.id.value = "";

            if (note) {
                titleEl.textContent = "Edit Note";
                form.id.value = note.id;
                form.title.value = note.title;
                form.content.value = note.content;
            } else {
                titleEl.textContent = "Add Note";
            }
        }

        static closeForm() {
            document.querySelector("#noteModal").classList.add("hidden");
        }

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
                        <button class="btn-small" onclick='NotesPage.openForm(${JSON.stringify(n)})'>Edit</button>
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


    DexaCore.events.on("page:loaded", (page) => {
        if (page === "notes") NotesPage.init();
    });

});
