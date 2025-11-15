(function waitForDexaCoreRegister(cb) {
  if (window.DexaCore && DexaCore.events) {
    cb();
  } else {
    setTimeout(() => waitForDexaCoreRegister(cb), 30);
  }
})(function() {
// original register.js code starts here
DexaCore.events.on("core:ready", () => {
class RegisterPage {
    static init() {
        const form = document.querySelector("#registerForm");
        form.onsubmit = async (e) => {
            e.preventDefault();
            const values = DexaForm.getValues("#registerForm");
            const error = DexaForm.validate({
                email: { required: true, email: true, label: "Email" },
                password: { required: true, min: 6, label: "Password" },
                confirm: { required: true, label: "Confirm Password" }
            }, values);
            if (error) return DexaToast.error(error);
            if (values.password !== values.confirm)
                return DexaToast.error("Passwords do not match");
            await DexaCore.auth.register(values.email, values.password);
        };
    }
}
DexaCore.events.on("page:loaded", (path) => {
    if (path === "/register") RegisterPage.init();
});
});
// original register.js code ends here
});
