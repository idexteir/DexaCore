window.DexaToast = {
    show(message, type = "info", duration = 3000) {
        const toast = document.createElement("div");
        toast.className = `dexacore-toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(msg) { this.show(msg, "success"); },
    error(msg) { this.show(msg, "error"); },
    info(msg) { this.show(msg, "info"); }
};
