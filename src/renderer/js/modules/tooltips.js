export function checkTooltipElements(root = document) {
    const tooltipElements = root.querySelectorAll("[tooltip]");
    const tooltips = document.querySelector(".tooltips");

    tooltips.innerHTML = "";

    tooltipElements.forEach(tooltipElement => {
        const tooltipContainer = document.createElement("div");
        tooltipContainer.classList.add("tooltip-container");

        const tooltipStyle = `
            :host {
                position: absolute;
                z-index: 999;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .tooltip {
                padding: 5px 10px;
                border-radius: 999px;
                background-color: white;
                box-shadow: 0 3px 10px rgb(0, 0, 0, .25);
                font-size: 14px;
                font-weight: normal;
                color: black;
                text-wrap: nowrap;
                transition: opacity .1s cubic-bezier(0.25, 1, 0.5, 1), scale .3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .tooltip.hidden {
                opacity: 0;
                scale: .9;
            }

            .tooltip::after {
                content: "";
                position: absolute;
                bottom: 100%;
                left: calc(50% - 5px);
                border-width: 5px;
                border-style: solid;
                border-color: transparent transparent white transparent;
            }
        `

        tooltipContainer.attachShadow({ mode: "open" });
        tooltipContainer.shadowRoot.innerHTML = `<style>${tooltipStyle}</style>`;

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.classList.add("hidden");

        tooltipContainer.shadowRoot.appendChild(tooltip);

        tooltip.innerHTML = tooltipElement.getAttribute("data-tooltip");

        tooltips.appendChild(tooltipContainer);

        tooltipElement.addEventListener("mouseenter", event => {
            const tooltipRect = tooltipContainer.getBoundingClientRect();
            const tooltipElementRect = tooltipElement.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            let x = Math.round(tooltipElementRect.x) + Math.round(tooltipElementRect.width) / 2 - Math.round(tooltipRect.width) / 2;
            let y = Math.round(tooltipElementRect.y) + Math.round(tooltipElementRect.height) + 5;

            if (x > windowWidth) {
                x = windowWidth - Math.round(tooltipRect.width) - 5;
            }

            if (tooltipElementRect.bottom + Math.round(tooltipRect.height) + 5 > windowHeight) {
                y = windowHeight - Math.round(tooltipRect.height) - 5;
            }

            tooltipContainer.style.left = x + "px";
            tooltipContainer.style.top = y + "px";

            tooltip.classList.remove("hidden");
        });

        tooltipElement.addEventListener("mouseleave", () => { tooltip.classList.add("hidden"); });
    });
}