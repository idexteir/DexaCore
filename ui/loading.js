class DexaLoading {
    static show(text = "Loading...") {
        if (document.querySelector(".dexacore-loading")) return;

        const el = document.createElement("div");
        el.className = "dexacore-loading";
        el.innerHTML = `
            <div class="loader"></div>
            <p>${text}</p>
        `;
        document.body.appendChild(el);
    }

    static hide() {
        const el = document.querySelector(".dexacore-loading");
        if (el) el.remove();
    }
}
