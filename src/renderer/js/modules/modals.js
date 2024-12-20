import { checkRippleElements } from "./ripples.js";
import { renameProjectFn, deleteProjectFn } from "./preload_functions.js";
import { updateProjects } from "./projects.js";

function createModal(name, content) {
    const modalContainer = document.createElement("div");
    modalContainer.classList.add("modal-container");

    modalContainer.attachShadow({ mode: "open" });
    modalContainer.shadowRoot.innerHTML = `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                user-select: none;
                font-family: "Inter", sans-serif;
                -webkit-font-smoothing: antialiased;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            :host {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, .8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                backdrop-filter: blur(15px);
                opacity: 0;
                animation: fadeIn .15s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            @keyframes modalGrow {
                to {
                    scale: 1;
                }
            }

            .modal {
                background-color: rgb(255, 255, 255, .15);
                border: 1px solid rgba(255, 255, 255, .1);
                border-radius: 10px;
                padding: 20px;
                padding-top: 0;
                min-width: 300px;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                scale: .9;
                animation: modalGrow .35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            .modal-title {
                display: flex;
                align-items: center;
                justify-content: right;
                gap: 10px;
                padding-top: 20px;
                padding-inline: 10px;
            }

            .modal-title p {
                width: max-content;
                overflow: hidden;
                text-overflow: ellipsis;
                word-break: keep-all;
                white-space: nowrap;
                font-size: 21px;
                font-weight: 500;
            }

            .modal-title button {
                position: relative;
                width: max-content;
                height: max-content;
                background-color: rgb(255, 255, 255, .1);
                border: none;
                padding: 10px 20px;
                border-radius: 999px;
                cursor: pointer;
                margin-left: auto;
                transition: background-color .1s cubic-bezier(0.25, 1, 0.5, 1);
            }

            .modal-title button:hover {
                background-color: rgb(255, 255, 255, .2);
            }

            .modal-content {
                padding: 10px;
                padding-top: 20px;
                font-size: 16px;
                font-weight: normal;
                max-height: 400px;
                overflow-y: auto;
            }
        </style>

        <div class="modal">
            <div class="modal-title">
                ${name ? `<p>${name}</p>` : ""}
                <button id="close" ripple>Close</button>
            </div>
            <div class="modal-content"></div>
        </div>
    `;

    const modalContent = modalContainer.shadowRoot.querySelector(".modal-content");

    modalContent.attachShadow({ mode: "open" });
    modalContent.shadowRoot.innerHTML += `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: "Inter", sans-serif;
                user-select: none;
                -webkit-font-smoothing: antialiased;
            }

            :host {
                display: flex;
                gap: 10px;
            }

            button.modal-button {
                flex: 1 1;
                position: relative;
                background-color: rgb(255, 255, 255, .25);
                border: none;
                padding: 10px 20px;
                border-radius: 999px;
                cursor: pointer;
                transition: background-color .1s cubic-bezier(0.25, 1, 0.5, 1);
            }

            button.modal-button:hover {
                background-color: rgb(255, 255, 255, .35);
            }

            input.modal-input {
                flex: 1 1;
                background-color: transparent;
                box-shadow: 0 0 0 1px white;
                border: none;
                outline: none;
                padding: 10px 20px;
                border-radius: 999px;
                color: white;
                transition: all .15s cubic-bezier(0.25, 1, 0.5, 1);
            }

            input.modal-input:hover {
                background-color: rgba(255, 255, 255, .1);
            }

            input.modal-input:focus {
                background-color: rgba(255, 255, 255, .2);
                box-shadow: 0 0 0 2px white;
            }

            input.modal-input::placeholder {
                color: rgba(255, 255, 255, .75);
            }
        </style>
    `
    modalContent.shadowRoot.innerHTML += content;

    document.body.appendChild(modalContainer);

    const modal = modalContainer.shadowRoot.querySelector(".modal");
    const modalButton = modal.querySelector("#close");

    const callback = (root) => {
        checkRippleElements(root);
    }

    callback(modalContainer.shadowRoot);
    callback(modalContent.shadowRoot);

    modalContainer.addEventListener("close-modal", () => {
        const animation = modalContainer.animate([{ opacity: 0 }], { duration: 100, easing: "cubic-bezier(0.25, 1, 0.5, 1)", fill: "forwards" });

        animation.onfinish = () => {
            modalContainer.remove();
            modalContainer.dispatchEvent(new CustomEvent("ready-to-close"));
        }
    });

    modalButton.focus();

    modalButton.addEventListener("click", () => {
        modalContainer.dispatchEvent(new CustomEvent("close-modal"));
    });

    return modalContainer;
}

// Custom modals

export function renameModal(projectName) {
    const modalHTML = `
        <style>
            form {
                flex: 1 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
        </style>

        <form onsubmit="return false">
            <input class="modal-input" id="popup input" type="text" placeholder="Space name" spellcheck="false" autocomplete="off" required>
            <button class="modal-button" type="submit" ripple>Confirm</button>
        </form>
    `;

    let modalContainer = createModal("Rename", modalHTML);

    const confirmButton = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("button");
    const input = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("input");

    input.value = projectName;
    input.focus();

    confirmButton.addEventListener("click", event => {
        renameProjectFn(projectName, input.value.replace(/ /g, "-"));

        modalContainer.dispatchEvent(new CustomEvent("close-modal"));
        modalContainer.addEventListener("ready-to-close", () => {
            updateProjects();
        });
    });
}

export function deleteModal(projectName) {
    const modalHTML = `
        <button class="modal-button" type="submit" ripple>Confirm</button>
    `;

    let modalContainer = createModal("Delete", modalHTML);

    const confirmButton = modalContainer.shadowRoot.querySelector("div.modal-content").shadowRoot.querySelector("button");

    confirmButton.focus();

    confirmButton.addEventListener("click", event => {
        deleteProjectFn(projectName);

        modalContainer.dispatchEvent(new CustomEvent("close-modal"));
        modalContainer.addEventListener("ready-to-close", () => {
            updateProjects();
        });
    });
}