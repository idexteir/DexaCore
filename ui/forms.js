window.DexaForm = {
    getValues(formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) return {};

        const data = {};
        // Include ALL inputs including hidden ones
        form.querySelectorAll("input, textarea, select").forEach(input => {
            if (input.disabled) return; // Skip disabled but NOT hidden
            
            const value = input.value?.trim() || "";
            data[input.name] = value;
        });

        console.log("[DexaForm] getValues result:", data);
        return data;
    },

    validate(rules, values) {
        for (let key in rules) {
            const rule = rules[key];
            const value = values[key];

            if (rule.required && (!value || value === "")) {
                return `${rule.label || key} is required`;
            }

            if (rule.min && value.length < rule.min) {
                return `${rule.label || key} must be at least ${rule.min} characters`;
            }

            if (rule.email) {
                const re = /\S+@\S+\.\S+/;
                if (!re.test(value)) return `Invalid email`;
            }
        }

        return null;
    },

    populateDefaults(formSelector, fields) {
        const form = document.querySelector(formSelector);
        if (!form) return;

        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            if (field.default && typeof field.default === 'function') {
                const input = form.querySelector(`[name="${fieldName}"]`);
                if (input && !input.value) {
                    const defaultValue = field.default();
                    input.value = defaultValue;
                    console.log(`[DexaForm] Set default ${fieldName} = ${defaultValue}`);
                }
            }
        });
    }
};
