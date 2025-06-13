import { globalStyles } from "./utils.js";

class Modal extends HTMLElement {
    constructor(title = "", content, buttons = null, cancelButton = true, removeOnClose = false) {
        super();

        this.removeOnClose = removeOnClose;
        this.waitingForAuthorization = false;

        const defaultButtons = `
            ${cancelButton ? `<ascended-button cancel>Cancel</ascended-button>` : ""}
            <ascended-button primary action>Ok</ascended-button>
        `;

        const buttonsHTML = buttons ? buttons.join("") : defaultButtons;
        const titleHTML = title ? `<div class="title"><p>${title}</p></div>` : "";
        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
            <style>
                ${globalStyles}

                .modal-container {
                    position: fixed;
                    z-index: 100;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, .5);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    pointer-events: none;
                }

                .modal {
                    background-color: rgb(30, 30, 35);
                    border-radius: 25px;
                    padding: 20px;
                    min-width: 350px;
                    max-width: 50%;
                    max-height: 60%;
                    display: flex;
                    flex-direction: column;
                }

                .modal .title {
                    font-size: 20px;
                    font-weight: 500;
                    padding-inline: 20px;
                    padding-top: 20px;
                    padding-bottom: 15px;
                    margin-inline: -20px;
                    margin-top: -20px;
                    margin-bottom: 15px;
                    border-top-left-radius: 25px;
                    border-top-right-radius: 25px;
                    background-color: rgb(25, 25, 30);
                    color: rgb(205, 205, 205);
                }

                .modal .content {
                    flex: 1;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    font-size: 14px;
                    border-radius: 10px;
                }

                .modal .content[has-scrollbar] {
                    padding-right: 5px;
                    padding-bottom: 10px;
                }

                .modal .buttons {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 15px;
                    gap: 10px;
                    font-size: 14px;
                }
            </style>

            <div class="modal-container">
                <div class="modal">
                    ${title ? titleHTML : ""}
                    <div class="content"></div>
                    <div class="buttons">
                        ${buttonsHTML}
                    </div>
                </div>
            </div>
        `;

        this.EVENTS = {
            ACTION_BUTTON_CLICK: {
                name: "ascended-modal-action-button-click",
                event: new CustomEvent("ascended-modal-action-button-click", { bubbles: true, composed: true }),
            },
            CANCEL_BUTTON_CLICK: {
                name: "ascended-modal-cancel-button-click",
                event: new CustomEvent("ascended-modal-cancel-button-click", { bubbles: true, composed: true }),
            },
            ASK_EXIT: {
                name: "ascended-modal-ask-exit",
                event: new CustomEvent("ascended-modal-ask-exit", { bubbles: true, composed: true }),
            },
            AUTHORIZE_EXIT: {
                name: "ascended-modal-authorize-exit",
                event: new CustomEvent("ascended-modal-authorize-exit", { bubbles: true, composed: true }),
            },
            DENY_EXIT: {
                name: "ascended-modal-deny-exit",
                event: new CustomEvent("ascended-modal-deny-exit", { bubbles: true, composed: true }),
            },
        }

        this.modalContainer = shadow.querySelector(".modal-container");
        this.modalElement = shadow.querySelector(".modal");
        this.modalContent = shadow.querySelector(".content");
        this.modalButtons = shadow.querySelector(".buttons");

        this.contentShadow = this.modalContent.attachShadow({ mode: "open" });
        this.contentShadow.innerHTML = `
            <style>
                ${globalStyles}
            </style>

            ${content}
        `;

        const checkScrollbar = () => {
            if (this.modalContent.scrollHeight > this.modalContent.clientHeight) {
                this.modalContent.toggleAttribute("has-scrollbar", true);
            }
            else {
                this.modalContent.toggleAttribute("has-scrollbar", false);
            }

            requestAnimationFrame(checkScrollbar);
        }

        checkScrollbar();

        this.actionButton = this.modalButtons.querySelector("[action]");
        this.cancelButton = this.modalButtons.querySelector("[cancel]");

        document.body.appendChild(this);

        this._setupEventListeners();
        this._setupFocusTrap();
    }

    _setupEventListeners() {
        if (this.actionButton) {
            this.actionButton.addEventListener("click", () => {
                if (this.waitingForAuthorization) return;
                this._actionClick();
                this._askExit();
            });
        }
        if (this.cancelButton) {
            this.cancelButton.addEventListener("click", () => {
                this._cancelClick();
                this._exit();
            });
        }

        this.addEventListener(this.EVENTS.AUTHORIZE_EXIT.name, () => {
            this.waitingForAuthorization = false;
            const animation = this.hide();

            animation.onfinish = () => {
                if (this.removeOnClose) {
                    this.remove();
                }
            };
        });

        this.addEventListener(this.EVENTS.DENY_EXIT.name, () => {
            this.waitingForAuthorization = false;
        });

        this.modalContainer.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this._cancelClick();
                this._exit();
            }
            if (event.key === "Enter") {
                if (this.actionButton && !this.waitingForAuthorization) {
                    event.preventDefault();
                    this.actionButton.click();
                }
            }
        });
    }

    _setupFocusTrap() {
        const elements = Array.from(document.body.querySelectorAll("*")).map(el => ({ element: el, tabindex: el.getAttribute("tabindex") }));
        const focusableElements = elements.filter(el => el.offsetParent !== null);

        if (focusableElements.length === 0) return;

        elements.forEach(el => {
            if (el.element === this) {
                return;
            }

            el.element.setAttribute("tabindex", "-1");
        });

        this.addEventListener(this.EVENTS.AUTHORIZE_EXIT.name, () => {
            elements.forEach(el => {
                if (!el.tabindex) {
                    el.element.removeAttribute("tabindex");
                    return;
                }

                el.element.setAttribute("tabindex", el.tabindex);
            });
        });

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        if (this.actionButton) {
            this.actionButton.focus();
        }
        else if (this.cancelButton) {
            this.cancelButton.focus();
        }
    }

    _actionClick() {
        this.dispatchEvent(this.EVENTS.ACTION_BUTTON_CLICK.event);
    }

    _cancelClick() {
        this.dispatchEvent(this.EVENTS.CANCEL_BUTTON_CLICK.event);
    }

    _askExit() {
        if (this.waitingForAuthorization) {
            return;
        }
        this.dispatchEvent(this.EVENTS.ASK_EXIT.event);
        this.waitingForAuthorization = true;
    }

    _exit() {
        this.dispatchEvent(this.EVENTS.AUTHORIZE_EXIT.event);
    }

    show() {
        const reducedMotion = document.body.hasAttribute("reduced-motion");
        const animation = this.modalContainer.animate([
            { opacity: 1, pointerEvents: "auto" },
        ], { duration: reducedMotion ? 0 : 150, easing: "ease", fill: "forwards" });
        this.modalElement.animate([
            { transform: "scale(.9) perspective(900px) translateY(5%) rotateX(-25deg)" },
            { transform: "scale(1)" },
        ], { duration: reducedMotion ? 0 : 300, easing: "ease", fill: "forwards" });

        return animation;
    }

    hide() {
        const reducedMotion = document.body.hasAttribute("reduced-motion");
        const animation = this.modalContainer.animate([
            { opacity: 0, pointerEvents: "none" },
        ], { duration: reducedMotion ? 0 : 150, easing: "ease", fill: "forwards" });
        this.modalElement.animate([
            { transform: "scale(.9) perspective(900px) translateY(5%) rotateX(-25deg)" },
        ], { duration: reducedMotion ? 0 : 300, easing: "ease", fill: "forwards" });

        return animation;
    }

    setupRemoval() {
        this.removeOnClose = true;
    }

    authorizeExit() {
        this.dispatchEvent(this.EVENTS.AUTHORIZE_EXIT.event);
    }

    denyExit() {
        this.dispatchEvent(this.EVENTS.DENY_EXIT.event);
    }
}

customElements.define("ascended-modal", Modal);

export { Modal };