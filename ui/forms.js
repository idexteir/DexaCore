class DexaForm {

    static getValues(formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) return {};

        const data = {};
        form.querySelectorAll("input, textarea, select").forEach(input => {
            data[input.name] = input.value.trim();
        });

        return data;
    }

    static validate(rules, values) {
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

        return null; // No errors
    }
}
