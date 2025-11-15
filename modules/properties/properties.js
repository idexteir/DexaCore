/* ---------------------------------------
    Register Entity
--------------------------------------- */

window.addEventListener("core:ready", () => {

    Entities.register("Property", {
        title: "Properties",
        table: "properties",
        storageKey: "properties",
        useDB: true,
        fields: {
            title: { required: true, label: "Title" },
            description: { required: true, label: "Description" },
            price: { required: true, number: true, label: "Price" },
            type: { required: true, label: "Type" },
            status: { required: true, label: "Status" },
            location: { required: true, label: "Location" }
        }
    });


    /* ---------------------------------------
        Page Logic
    --------------------------------------- */

    class PropertiesPage {

        static init() {
            PropertiesPage.loadList();

            const form = document.querySelector("#propForm");
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();

                    const values = DexaForm.getValues("#propForm");
                    const error = DexaForm.validate(Entities.getFields("Property"), values);

                    if (error) return DexaToast.error(error);

                    await Entities.save("Property", values);

                    DexaToast.success("Saved!");
                    PropertiesPage.closeForm();
                    PropertiesPage.loadList();
                };
            }
        }

        static openForm(item = null) {
            const modal = document.querySelector("#propModal");
            const title = document.querySelector("#modalTitle");
            const form = document.querySelector("#propForm");

            modal.classList.remove("hidden");
            form.reset();
            form.id.value = "";

            if (item) {
                title.textContent = "Edit Property";
                Object.keys(item).forEach(k => form[k].value = item[k]);
            } else {
                title.textContent = "Add Property";
            }
        }

        static closeForm() {
            document.querySelector("#propModal").classList.add("hidden");
        }

        static async loadList() {
            let list = await Entities.list("Property");
            const container = document.querySelector("#propList");

            const search = (document.querySelector("#searchInput")?.value || "").toLowerCase();
            const type = document.querySelector("#typeFilter")?.value || "";
            const status = document.querySelector("#statusFilter")?.value || "";

            if (search) {
                list = list.filter(p =>
                    p.title.toLowerCase().includes(search) ||
                    p.description.toLowerCase().includes(search)
                );
            }

            if (type) list = list.filter(p => p.type === type);
            if (status) list = list.filter(p => p.status === status);

            container.innerHTML = "";

            if (list.length === 0) {
                container.innerHTML = "<p class='empty'>No properties found.</p>";
                return;
            }

            list.forEach(p => {
                const row = document.createElement("div");
                row.className = "prop-row";

                row.innerHTML = `
                    <div class="prop-info">
                        <h4>${p.title}</h4>
                        <p>${p.description}</p>
                        <span class="badge">${p.type}</span>
                        <span class="badge status-${p.status.toLowerCase()}">${p.status}</span>
                        <p class="location">${p.location}</p>
                        <p class="price">${p.price} SAR</p>
                    </div>

                    <div class="prop-actions">
                        <button class="btn-small" onclick='PropertiesPage.openForm(${JSON.stringify(p)})'>Edit</button>
                        <button class="btn-delete" onclick="PropertiesPage.delete('${p.id}')">Delete</button>
                    </div>
                `;

                container.appendChild(row);
            });
        }

        static async delete(id) {
            DexaModal.show({
                title: "Delete Property?",
                content: "This action cannot be undone.",
                confirmText: "Delete",
                onConfirm: async () => {
                    await Entities.delete("Property", id);
                    DexaToast.success("Deleted!");
                    PropertiesPage.loadList();
                }
            });
        }
    }


    /* Auto-init when /properties loads */
    DexaCore.events.on("page:loaded", (page) => {
        if (page === "properties") PropertiesPage.init();
    });

});
