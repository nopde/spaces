import { RippleHandler } from "./utils.js";

class MenuItem {
    constructor(content, callback = () => { }) {
        this.content = content;
        this.callback = callback;
    }
}

class Menu {
    constructor(parentElement, items, closeOnClick = true, notRemovable = false) {
        if (closeOnClick === null || closeOnClick === undefined) {
            closeOnClick = true;
        }

        this.parentElement = parentElement;
        this.active = false;

        const menuContainer = document.createElement("ascended-menu");
        menuContainer.style.position = "absolute";
        menuContainer.style.top = "0";
        menuContainer.style.bottom = "0";
        menuContainer.style.left = "0";
        menuContainer.style.right = "0";
        menuContainer.style.zIndex = "100";
        menuContainer.style.pointerEvents = "none";

        menuContainer.toggleAttribute("not-removable", notRemovable);

        this.menuContainer = menuContainer;

        const parentElementRect = this.parentElement.getBoundingClientRect();

        menuContainer.attachShadow({ mode: "open" });
        menuContainer.shadowRoot.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    font-family: "Inter", sans-serif;
                    box-sizing: border-box;
                    user-select: none;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                }

                .icons {
                    font-family: "Segoe Fluent Icons";
                    font-size: inherit;
                    font-weight: inherit;
                    color: inherit;
                }

                .backdrop {
                    position: absolute;
                    z-index: 5;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    pointer-events: none;
                }

                :host:has([active]) .backdrop {
                    pointer-events: all;
                }

                .menu {
                    position: absolute;
                    z-index: 10;
                    top: 0;
                    left: 0;
                    min-width: ${parentElementRect.width}px;
                    width: max-content;
                    height: max-content;
                    background-color: rgb(30, 30, 35);
                    font-size: 14px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    opacity: 0;
                    pointer-events: none;
                    overflow: hidden;
                    translate: 0px -10px;
                    transition: opacity 75ms ease, translate 250ms cubic-bezier(.175, .885, .32, 1.275);
                }

                .menu[active] {
                    opacity: 1;
                    translate: 0px 0px;
                    pointer-events: all;
                }

                .menu-item {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: start;
                    gap: 10px;
                    padding: 10px 20px;
                    user-select: none;
                    cursor: pointer;
                    color: rgba(255, 255, 255, .75);
                    transition: all 75ms linear;
                }

                .menu-item:hover {
                    background-color: rgba(0, 0, 0, .25);
                }

                .separator-item {
                    height: 1px;
                    background-color: rgba(255, 255, 255, .1);
                }
            </style>

            <div class="backdrop"></div>
            <div class="menu"></div>
        `;

        this.backdropElement = menuContainer.shadowRoot.querySelector(".backdrop");
        this.menuElement = menuContainer.shadowRoot.querySelector(".menu");

        document.body.appendChild(menuContainer);

        this.backdropElement.addEventListener("click", () => {
            this.toggle();
        });

        items.forEach(item => {
            if (item instanceof MenuItem === false) {
                throw new Error("Menu items must be instances of MenuItem");
            }

            if (item.content.toLowerCase() === "separator") {
                const separator = document.createElement("div");
                separator.classList.add("separator-item");

                this.menuElement.appendChild(separator);
                return;
            }

            const menuItem = document.createElement("div");
            menuItem.classList.add("menu-item");
            menuItem.innerHTML = item.content;

            menuItem.addEventListener("click", () => {
                item.callback();

                if (closeOnClick) {
                    this.toggle();
                }
            });

            new RippleHandler(menuItem, "255, 255, 255", .16, true);

            this.menuElement.appendChild(menuItem);
        });

        if (this.parentElement) {
            this.parentElement.addEventListener("click", () => {
                this.toggle();
            });
        }
    }

    changePosition() {
        const parentElementRect = this.parentElement.getBoundingClientRect();

        this.menuElement.style.left = `${parentElementRect.x}px`;
        this.menuElement.style.top = `${parentElementRect.y + parentElementRect.height + 5}px`;

        const menuElementRect = this.menuElement.getBoundingClientRect();

        const horizontalLeftOverflow = menuElementRect.x < 0;
        const horizontalRightOverflow = menuElementRect.x + menuElementRect.width > window.innerWidth;
        const verticalOverflow = menuElementRect.y + menuElementRect.height > window.innerHeight;

        if (horizontalLeftOverflow) {
            this.menuElement.style.left = "0";
        }
        else if (horizontalRightOverflow) {
            this.menuElement.style.left = `${parentElementRect.x + parentElementRect.width - menuElementRect.width}px`;
        }

        if (verticalOverflow) {
            this.menuElement.style.top = `${parentElementRect.y - menuElementRect.height - 5}px`;
        }
    }

    toggle() {
        this.changePosition();

        this.active = !this.active;
        this.menuElement.toggleAttribute("active", this.active);
    }
}

export { Menu, MenuItem };