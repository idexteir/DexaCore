class DexaModal {
    static show({ title = "", content = "", onConfirm = null, onCancel = null, confirmText = "OK", cancelText = "Cancel" }) {

        // Remove old modal if exists
        const old = document.querySelector(".dexacore-modal-overlay");
        if (old) old.remove();

        const wrapper = document.createElement("div");
        wrapper.className = "dexacore-modal-overlay";
        wrapper.innerHTML = `
            <div class="dexacore-modal">
                <h3>${title}</h3>
                <div class="modal-content">${content}</div>
                <div class="modal-actions">
                    <button class="modal-btn cancel">${cancelText}</button>
                    <button class="modal-btn confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(wrapper);

        wrapper.querySelector(".cancel").onclick = () => {
            if (onCancel) onCancel();
            wrapper.remove();
        };

        wrapper.querySelector(".confirm").onclick = () => {
            if (onConfirm) onConfirm();
            wrapper.remove();
        };
    }
}
