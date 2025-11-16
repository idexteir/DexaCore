window.Crud = {
    currentEntity: null,
    currentPage: 1,
    perPage: 10,
    currentFilters: {},
    currentSearch: "",

    async init(entityName) {
        this.currentEntity = entityName;
        const entity = Entities.registry[entityName];
        if (!entity) {
            console.error(`[Crud] Entity ${entityName} not found`);
            return;
        }

        // Ensure table exists
        await Entities.ensureTable(entityName);

        // Set title
        const titleEl = document.getElementById("crud-title");
        if (titleEl) titleEl.textContent = entity.title || entityName;

        // Setup form
        this.setupForm(entity);

        // Setup table
        this.setupTable(entity);

        // Setup search
        this.setupSearch();

        // Setup add button
        const addBtn = document.getElementById("crud-add-btn");
        if (addBtn) {
            addBtn.onclick = () => this.openForm();
        }

        // Load data
        await this.loadData();
    },

    setupForm(entity) {
        const form = document.getElementById("crud-form");
        const fieldsContainer = document.getElementById("crud-form-fields");
        if (!form || !fieldsContainer) return;

        fieldsContainer.innerHTML = "";

        Object.keys(entity.fields).forEach(fieldName => {
            const field = entity.fields[fieldName];
            const fieldEl = this.createFormField(fieldName, field);
            fieldsContainer.appendChild(fieldEl);
        });

        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.save();
        };
        
        // Populate default values for new forms
        if (typeof DexaForm.populateDefaults === 'function') {
            DexaForm.populateDefaults("#crud-form", entity.fields);
        }
    },

    createFormField(name, field) {
        const group = document.createElement("div");
        group.className = "form-group";

        let input;

        // DON'T create hidden fields in the form at all
        // They will be added programmatically in save()
        if (field.type === "hidden") {
            return group; // Return empty group
        }

        // Regular visible fields
        const label = document.createElement("label");
        label.textContent = field.label || name;
        if (field.required) label.innerHTML += " *";
        group.appendChild(label);

        if (field.type === "textarea") {
            input = document.createElement("textarea");
            input.rows = field.rows || 4;
        } else if (field.type === "select") {
            input = document.createElement("select");
            if (field.options) {
                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt.value;
                    option.textContent = opt.label;
                    input.appendChild(option);
                });
            }
        } else {
            input = document.createElement("input");
            input.type = field.type || "text";
            if (field.number) input.type = "number";
            if (field.email) input.type = "email";
        }

        input.name = name;
        input.id = `field-${name}`;
        input.placeholder = field.placeholder || field.label || name;
        if (field.required) input.required = true;
        if (field.min) input.minLength = field.min;
        if (field.max) input.maxLength = field.max;

        group.appendChild(input);
        return group;
    },

    setupTable(entity) {
        const thead = document.getElementById("crud-thead");
        if (!thead) return;

        const row = document.createElement("tr");
        
        // Add columns for each field (skip hidden fields)
        Object.keys(entity.fields).forEach(fieldName => {
            const field = entity.fields[fieldName];
            
            // Skip hidden fields in table
            if (field.type === "hidden") return;
            
            const th = document.createElement("th");
            th.textContent = field.label || fieldName;
            row.appendChild(th);
        });

        // Add actions column
        const actionsTh = document.createElement("th");
        actionsTh.textContent = "Actions";
        row.appendChild(actionsTh);

        thead.innerHTML = "";
        thead.appendChild(row);
    },

    setupSearch() {
        const searchInput = document.getElementById("crud-search");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.currentSearch = e.target.value;
                this.currentPage = 1;
                this.loadData();
            });
        }
    },

    async loadData() {
        const tbody = document.getElementById("crud-tbody");
        if (!tbody) return;

        DexaLoading.show("Loading...");

        try {
            const entity = Entities.registry[this.currentEntity];
            const options = {
                search: this.currentSearch,
                searchField: Object.keys(entity.fields)[0], // Search in first field
                filters: this.currentFilters,
                sortBy: "id",
                sortAsc: false
            };

            const result = await Entities.paginate(this.currentEntity, this.currentPage, this.perPage, options);
            
            tbody.innerHTML = "";

            if (result.data.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="${Object.keys(entity.fields).length + 1}" class="empty">No items found</td>`;
                tbody.appendChild(row);
            } else {
                result.data.forEach(item => {
                    const row = document.createElement("tr");
                    
                    Object.keys(entity.fields).forEach(fieldName => {
                        const field = entity.fields[fieldName];
                        
                        // Skip hidden fields in table display
                        if (field.type === "hidden") return;
                        
                        const td = document.createElement("td");
                        const value = item[fieldName];
                        td.textContent = value !== null && value !== undefined ? value : "";
                        row.appendChild(td);
                    });

                    const actionsTd = document.createElement("td");
                    actionsTd.className = "crud-actions";

                    const editBtn = document.createElement("button");
                    editBtn.className = "btn-small";
                    editBtn.textContent = "Edit";
                    editBtn.onclick = () => this.openForm(item);

                    const deleteBtn = document.createElement("button");
                    deleteBtn.className = "btn-delete";
                    deleteBtn.textContent = "Delete";
                    deleteBtn.onclick = () => this.delete(item.id);

                    actionsTd.appendChild(editBtn);
                    actionsTd.appendChild(deleteBtn);
                    row.appendChild(actionsTd);

                    tbody.appendChild(row);
                });
            }

            this.renderPagination(result);
        } catch (err) {
            console.error("[Crud] Load error:", err);
            DexaToast.error("Failed to load data");
        } finally {
            DexaLoading.hide();
        }
    },

    renderPagination(result) {
        const pagination = document.getElementById("crud-pagination");
        if (!pagination) return;

        if (result.totalPages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        pagination.innerHTML = `
            <button class="btn-pagination" ${this.currentPage === 1 ? "disabled" : ""} onclick="Crud.goToPage(${this.currentPage - 1})">← Previous</button>
            <span>Page ${this.currentPage} of ${result.totalPages} (${result.total} total)</span>
            <button class="btn-pagination" ${this.currentPage === result.totalPages ? "disabled" : ""} onclick="Crud.goToPage(${this.currentPage + 1})">Next →</button>
        `;
    },

    goToPage(page) {
        this.currentPage = page;
        this.loadData();
    },

    openForm(item = null) {
        const modal = document.getElementById("crud-modal");
        const form = document.getElementById("crud-form");
        const titleEl = document.getElementById("crud-form-title");
        
        if (!modal || !form) return;

        modal.classList.remove("hidden");
        form.reset();
        document.getElementById("crud-form-id").value = "";

        if (item) {
            titleEl.textContent = "Edit Item";
            Object.keys(item).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = item[key];
            });
            document.getElementById("crud-form-id").value = item.id;
        } else {
            titleEl.textContent = "Add Item";
            
            // Populate default values for NEW forms only
            const entity = Entities.registry[this.currentEntity];
            if (entity && typeof DexaForm.populateDefaults === 'function') {
                DexaForm.populateDefaults("#crud-form", entity.fields);
            }
        }
    },

    closeForm() {
        const modal = document.getElementById("crud-modal");
        if (modal) modal.classList.add("hidden");
    },

    async save() {
        const form = document.getElementById("crud-form");
        if (!form) return;

        const values = DexaForm.getValues("#crud-form");
        const entity = Entities.registry[this.currentEntity];

        console.log("[Crud] Final values before save:", values);
        console.log("[Crud] Current user:", DexaCore.session?.getUser());

        // Validate required fields (skip hidden fields)
        const validationRules = {};
        Object.keys(entity.fields).forEach(key => {
            const field = entity.fields[key];
            // Skip hidden fields in validation
            if (field.required && field.type !== "hidden") {
                validationRules[key] = { 
                    required: true, 
                    label: field.label 
                };
            }
        });

        const error = DexaForm.validate(validationRules, values);
        if (error) {
            DexaToast.error(error);
            return;
        }

        DexaLoading.show("Saving...");

        try {
            const id = document.getElementById("crud-form-id")?.value;
            
            let result;
            if (id && id !== "") {
                // Update existing - use Entities.update (not Entities.save)
                result = await Entities.update(this.currentEntity, id, values);
            } else {
                // Create new - use Entities.save
                result = await Entities.save(this.currentEntity, values);
            }

            if (result.error) {
                throw new Error(result.error.message || "Save failed");
            }

            DexaToast.success("Saved successfully!");
            this.closeForm();
            await this.loadData();
        } catch (err) {
            console.error("[Crud] Save error:", err);
            DexaToast.error(err.message || "Failed to save");
        } finally {
            DexaLoading.hide();
        }
    },

    async delete(id) {
        DexaModal.show({
            title: "Delete Item?",
            content: "This action cannot be undone.",
            confirmText: "Delete",
            onConfirm: async () => {
                DexaLoading.show("Deleting...");
                try {
                    await Entities.delete(this.currentEntity, id);
                    DexaToast.success("Deleted successfully!");
                    await this.loadData();
                } catch (err) {
                    DexaToast.error("Failed to delete");
                } finally {
                    DexaLoading.hide();
                }
            }
        });
    }
};

