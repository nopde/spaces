class Tooltip extends HTMLElement {
    constructor() {
        super();

        this.content = this.innerHTML;

        this.innerHTML = "";

        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
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

                :host {
                    position: absolute;
                    z-index: 999;
                    left: 0;
                    right: 0;
                    top: 100%;
                }

                .tooltip {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    z-index: 999;
                    top: calc(100% + 10px);
                    width: max-content;
                    background-color: white;
                    box-shadow: 0 2px 3px rgba(0, 0, 0, .25);
                    color: rgb(30, 30, 30);
                    font-size: 12px;
                    padding: 5px 10px;
                    border-radius: 9999px;
                    pointer-events: none;
                    white-space: nowrap;
                    opacity: 0;
                    transition: opacity 100ms ease;
                }

                .tooltip.active {
                    opacity: 1;
                }

                .triangle {
                    position: absolute;
                    z-index: 999;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 5px;
                    border-style: solid;
                    border-color: transparent transparent white transparent;
                    opacity: 0;
                    transition: opacity 100ms ease;
                }

                .triangle.active {
                    opacity: 1;
                }
            </style>
            <div class="triangle"></div>
            <div class="tooltip">${this.content}</div>
        `;

        this.tooltip = this.shadowRoot.querySelector(".tooltip");
        this.triangle = this.shadowRoot.querySelector(".triangle");

        this.parentElement.addEventListener("mouseenter", () => {
            this.toggle();
        });
        
        this.parentElement.addEventListener("mouseleave", () => {
            this.toggle();
        });
    }

    connectedCallback() {
        this.changePosition();
    }

    toggle() {
        this.tooltip.classList.toggle("active");
        this.triangle.classList.toggle("active");
    }

    changePosition() {
        let tooltipRect = this.tooltip.getBoundingClientRect();

        this.tooltip.style.left = `calc(50% - ${tooltipRect.width / 2}px)`;

        tooltipRect = this.tooltip.getBoundingClientRect();

        const horizontalLeftOverflow = tooltipRect.x < 0;
        const horizontalRightOverflow = tooltipRect.x + tooltipRect.width > window.innerWidth;

        if (horizontalLeftOverflow) {
            this.tooltip.style.left = "0";
        }
        else if (horizontalRightOverflow) {
            this.tooltip.style.left = "auto";
            this.tooltip.style.right = "0";
        }

        const verticalOverflow = tooltipRect.y + tooltipRect.height > window.innerHeight;
        if (verticalOverflow) {
            this.tooltip.style.top = "auto";
            this.tooltip.style.bottom = "calc(100% + 10px)";

            this.triangle.style.borderColor = "rgb(0, 0, 0, .5) transparent transparent transparent";
            this.triangle.style.top = "-10px";
        }
    }

    setText(text) {
        this.tooltip.innerHTML = text;
        this.changePosition();
    }
}

customElements.define("ascended-tooltip", Tooltip);