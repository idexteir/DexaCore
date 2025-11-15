class LoginPage {
    static init() {
        const form = document.querySelector("#loginForm");

        form.onsubmit = async (e) => {
            e.preventDefault();

            const values = DexaForm.getValues("#loginForm");

            const error = DexaForm.validate({
                email: { required: true, email: true, label: "Email" },
                password: { required: true, label: "Password" }
            }, values);

            if (error) return DexaToast.error(error);

            await DexaCore.auth.login(values.email, values.password);
        };
    }
}

DexaCore.events.on("page:loaded", (path) => {
    if (path === "/login") LoginPage.init();
});
