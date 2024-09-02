function createRipple(rippleElement, rippleColor, rippleOpacity) {
    const existingSurface = rippleElement.querySelector(":scope > ripple-surface");
    if (existingSurface) {
        return;
    }

    const rippleSurface = document.createElement("ripple-surface");

    const rippleSurfaceStyle = `
        :host {
            overflow: hidden;
            border-radius: inherit;
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        @keyframes grow {
            to {
                scale: 1;
            }
        }

        ripple {
            position: absolute;
            background: radial-gradient(closest-side, rgba(${rippleColor}, ${rippleOpacity}) max(100% - 70px, 65%), transparent 100%);
            border-radius: 100%;
            scale: .2;
            translate: -50% -50%;
            animation: grow .35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            transition: opacity .25s cubic-bezier(0.25, 1, 0.5, 1);
        }
    `;

    rippleSurface.attachShadow({ mode: "open" });
    rippleSurface.shadowRoot.innerHTML = `<style>${rippleSurfaceStyle}</style>`;

    rippleElement.appendChild(rippleSurface);

    rippleElement.addEventListener("pointerdown", event => {
        const ripple = document.createElement("ripple");

        var rect = rippleSurface.getBoundingClientRect(),
            offsetX = event.clientX - rect.left,
            offsetY = event.clientY - rect.top;

        const size = Math.max(rect.height, rect.width);
        const min = Math.min(rect.height, rect.width);
        let properSize = 0;

        if (min <= size / 2) {
            properSize = size * 1.5;
        }
        else {
            properSize = size * (1 + min / size);
        }

        ripple.style.width = `${properSize}px`;
        ripple.style.height = `${properSize}px`;

        ripple.style.left = `${offsetX}px`;
        ripple.style.top = `${offsetY}px`;

        ripple.animate([{ left: "50%", top: "50%" }], { duration: 500, easing: "cubic-bezier(0.25, 1, 0.5, 1)", fill: "forwards" });

        let animationEnded = false;

        ripple.addEventListener("animationend", event => {
            animationEnded = true;
        });

        rippleElement.addEventListener("pointerup", event => {
            if (animationEnded) {
                ripple.style.opacity = 0;
                setTimeout(() => {
                    ripple.remove();
                }, 300);
            }
            else {
                ripple.addEventListener("animationend", event => {
                    ripple.style.opacity = 0;
                    setTimeout(() => {
                        ripple.remove();
                    }, 300);
                });
            }
        });

        rippleElement.addEventListener("pointerleave", event => {
            if (animationEnded) {
                ripple.style.opacity = 0;
                setTimeout(() => {
                    ripple.remove();
                }, 300);
            }
            else {
                ripple.addEventListener("animationend", event => {
                    ripple.style.opacity = 0;
                    setTimeout(() => {
                        ripple.remove();
                    }, 300);
                });
            }
        });

        rippleSurface.shadowRoot.appendChild(ripple);

        event.stopPropagation();
    });
}

export function checkRippleElements(root = document) {
    const rippleElements = root.querySelectorAll("[ripple]");

    rippleElements.forEach(rippleElement => {
        const hasRippleColor = rippleElement.hasAttribute("ripple-color");
        const rippleColor = hasRippleColor ? rippleElement.getAttribute("ripple-color") : "255, 255, 255";
        const hasRippleOpacity = rippleElement.hasAttribute("ripple-opacity");
        const rippleOpacity = hasRippleOpacity ? rippleElement.getAttribute("ripple-opacity") : "0.08";

        createRipple(rippleElement, rippleColor, rippleOpacity);
    });
}