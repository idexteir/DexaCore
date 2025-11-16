window.Crud = {
    currentEntity: null,
    currentPage: 1,
    perPage: 10,
    currentFilters: {},
    currentSearch: "",

    async init(entityName) {
        this.currentEntity = entityName;
        await Entities.ensureTable(entityName);
        
        this.setupEventListeners();
        this.setupForm(Entities.registry[entityName]);
        this.setupTable(Entities.registry[entityName]);
        
        // Ensure modal starts hidden
        const modal = document.getElementById("crud-modal");
        if (modal) {
            modal.classList.add("hidden");
        }
        
        await this.loadData();
    },

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById("crud-add-btn");
        if (addBtn) {
            addBtn.onclick = () => this.openForm();
        }

        // Close modal button
        const closeBtn = document.getElementById("crud-modal-close");
        if (closeBtn) {
            closeBtn.onclick = () => this.closeForm();
        }

        // Cancel button
        const cancelBtn = document.getElementById("crud-cancel-btn");
        if (cancelBtn) {
            cancelBtn.onclick = () => this.closeForm();
        }

        // Search input
        const searchInput = document.getElementById("crud-search");
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.currentSearch = e.target.value;
                this.currentPage = 1;
                this.loadData();
            };
        }
    },

    setupForm(entity) {
        const form = document.getElementById("crud-form");
        
        if (!form) {
            console.error("[Crud] Form not found during setup");
            return;
        }

        // Just setup the submit handler, fields will be created when modal opens
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.save();
        };
        
        console.log("[Crud] Form submit handler attached");
    },

    createFormField(name, field) {
        console.log(`[Crud] Creating field: ${name}`, field);
        
        const group = document.createElement("div");
        group.className = "form-group";

        // Skip hidden fields - return null instead of comment
        if (field.type === "hidden") {
            return null;
        }

        // Create label
        const label = document.createElement("label");
        label.htmlFor = `field-${name}`;
        label.textContent = field.label || name;
        if (field.required) {
            const required = document.createElement("span");
            required.textContent = " *";
            required.style.color = "#e53e3e";
            label.appendChild(required);
        }
        group.appendChild(label);

        // Create input based on type
        let input;
        
        if (field.type === "textarea") {
            console.log(`[Crud] Creating textarea for ${name}`);
            input = document.createElement("textarea");
            input.rows = field.rows || 4;
        } else if (field.type === "select") {
            console.log(`[Crud] Creating select for ${name} with options:`, field.options);
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
            console.log(`[Crud] Creating input type ${field.type || "text"} for ${name}`);
            input = document.createElement("input");
            input.type = field.type || "text";
            if (field.number) input.type = "number";
            if (field.email) input.type = "email";
        }

        input.name = name;
        input.id = `field-${name}`;
        input.className = "form-control";
        input.placeholder = field.placeholder || field.label || name;
        
        if (field.required) input.required = true;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.minLength !== undefined) input.minLength = field.minLength;
        if (field.maxLength !== undefined) input.maxLength = field.maxLength;

        group.appendChild(input);

        // Add help text if provided
        if (field.help) {
            const help = document.createElement("small");
            help.className = "form-help";
            help.textContent = field.help;
            help.style.color = "#718096";
            help.style.fontSize = "0.875rem";
            help.style.marginTop = "4px";
            help.style.display = "block";
            group.appendChild(help);
        }

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
        const title = document.getElementById("crud-form-title");
        const fieldsContainer = document.getElementById("crud-form-fields");
        
        if (!modal || !form || !fieldsContainer) {
            console.error("[Crud] Modal elements not found");
            return;
        }

        const entity = Entities.registry[this.currentEntity];
        form.reset();
        fieldsContainer.innerHTML = "";
        
        Object.keys(entity.fields).forEach(fieldName => {
            const field = entity.fields[fieldName];
            if (field.type === "hidden") return;
            
            const fieldEl = this.createFormField(fieldName, field);
            if (fieldEl) fieldsContainer.appendChild(fieldEl);
        });
        
        if (title) {
            title.textContent = item ? `Edit ${entity.title}` : `Add ${entity.title}`;
        }

        if (item) {
            document.getElementById("crud-form-id").value = item.id || "";
            setTimeout(() => {
                Object.keys(entity.fields).forEach(fieldName => {
                    if (entity.fields[fieldName].type === "hidden") return;
                    const input = document.getElementById(`field-${fieldName}`);
                    if (input && item[fieldName] !== undefined) {
                        input.value = item[fieldName];
                    }
                });
            }, 10);
        } else {
            document.getElementById("crud-form-id").value = "";
        }

        modal.classList.remove("hidden");
    },

    closeForm() {
        const modal = document.getElementById("crud-modal");
        const form = document.getElementById("crud-form");
        
        if (modal) {
            modal.classList.add("hidden");
        }
        
        if (form) {
            form.reset();
        }
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

