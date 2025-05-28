import { globalStyles, RippleHandler } from "./utils.js";

class Container extends HTMLElement {
    constructor() {
        super();

        this.content = this.innerHTML;
        this.innerHTML = "";

        this.alignItems = this.hasAttribute("align-items") ? this.getAttribute("align-items") : "normal";
        this.justifyContent = this.hasAttribute("justify-content") ? this.getAttribute("justify-content") : "normal";
        this.direction = this.hasAttribute("direction") ? this.getAttribute("direction") : "row";
        this.gap = this.hasAttribute("gap") ? this.getAttribute("gap") : "0px";
        this.wrap = this.hasAttribute("wrap") ? this.getAttribute("wrap") : "no-wrap";

        this.fontSize = this.hasAttribute("font-size") ? this.getAttribute("font-size") : "inherit";
        this.fontWeight = this.hasAttribute("font-weight") ? this.getAttribute("font-weight") : "inherit";

        this.shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.shadow.innerHTML = `
            <style>
                ${globalStyles}

                :host {
                    --font-size: ${this.fontSize};
                    --font-weight: ${this.fontWeight};

                    --align-items: ${this.alignItems};
                    --justify-content: ${this.justifyContent};
                    --direction: ${this.direction};
                    --gap: ${this.gap};
                    --wrap: ${this.wrap};

                    width: max-content;
                    height: max-content;
                    font-size: var(--font-size);
                    font-weight: var(--font-weight);

                    color: inherit;

                    display: flex;
                    flex-direction: var(--direction);
                    align-items: var(--align-items);
                    justify-content: var(--justify-content);
                    gap: var(--gap);
                    flex-wrap: var(--wrap);
                }
            </style>

            ${this.content}
        `;
    }

    setDirection(direction) {
        this.direction = direction;
        this.style.setProperty("--direction", this.direction);
    }

    setGap(gap) {
        this.gap = gap;
        this.style.setProperty("--gap", this.gap);
    }

    setWrap(wrap) {
        this.wrap = wrap;
        this.style.setProperty("--wrap", this.wrap);
    }
}

class Button extends HTMLElement {
    constructor() {
        super();

        this.content = this.innerHTML;
        this.primary = this.hasAttribute("primary");
        this.disabled = this.hasAttribute("disabled");

        this.elevated = this.hasAttribute("elevated");
        this.primaryColor = this.hasAttribute("primary-color") ? this.getAttribute("primary-color") : "255, 255, 255";

        this.innerHTML = "";

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
            <style>
                ${globalStyles}

                :host {
                    width: inherit;
                    height: inherit;
                    font-size: inherit;
                    font-weight: inherit;
                    border-radius: 9999px;
                }

                .button {
                    -webkit-app-region: no-drag;
                    position: relative;
                    width: inherit;
                    height: inherit;
                    font-size: inherit;
                    font-weight: inherit;
                    padding: 10px 20px;
                    border: none;
                    outline: none;
                    border-radius: inherit;
                    background-color: rgba(255, 255, 255, .1);
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    white-space: nowrap;
                    transition: all 67ms linear;
                }

                .button:hover,
                .button:active {
                    background-color: rgba(255, 255, 255, .2);
                }

                .button.primary {
                    background-color: rgb(${this.primaryColor});
                    color: rgb(30, 30, 30);
                }

                .button.primary:hover,
                .button.primary:active {
                    filter: brightness(0.85);
                }

                :host:host-context(body:not([ripples])) .button:active {
                    filter: brightness(0.75);
                }

                .button[disabled] {
                    opacity: .5;
                    pointer-events: none;
                }

                .button[elevated] {
                    box-shadow: 0 0 10px rgba(0, 0, 0, .25);
                }

                :host:host-context(body:not([ripples])) .button ripple-surface {
                    display: none;
                }
            </style>

            <button class="button ${this.primary ? "primary" : ""}" ${this.disabled ? "disabled" : ""} ${this.elevated ? "elevated" : ""}>${this.content}</button>
        `;

        this.EVENTS = {
            CLICK: {
                name: "ascended-button-click",
                event: new CustomEvent("ascended-button-click", { bubbles: true, composed: true }),
            }
        }

        this.buttonElement = shadow.querySelector("button");

        this.setupEventListeners();

        const rippleColor = this.primary ? "0, 0, 0" : "255, 255, 255";
        new RippleHandler(this.buttonElement, rippleColor, .16, true);
    }

    setupEventListeners() {
        this.buttonElement.addEventListener("click", () => {
            this.dispatchEvent(this.EVENTS.CLICK.event);
        });
    }

    focus() {
        this.buttonElement.focus();
    }

    toggleDisable() {
        this.disabled = !this.disabled;
        this.buttonElement.disabled = this.disabled;
    }
}

class TextInput extends HTMLElement {
    constructor() {
        super();

        this.label = this.hasAttribute("label") ? this.getAttribute("label") : "";

        this.valueAttr = this.hasAttribute("value") ? `value="${this.getAttribute("value")}"` : "";
        this.placeholderAttr = this.hasAttribute("placeholder") ? `placeholder="${this.getAttribute("placeholder")}"` : "";

        this.censored = this.hasAttribute("censored");
        this.disabled = this.hasAttribute("disabled");

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
            <style>
                ${globalStyles}

                :host {
                    font-size: inherit;
                    font-weight: inherit;
                }

                .text-input-container {
                    position: relative;
                    font-size: inherit;
                    font-weight: inherit;
                    overflow: hidden;
                }

                .label {
                    padding-left: 15px;
                    padding-bottom: 10px;
                    font-size: inherit;
                    color: rgba(255, 255, 255, .75);
                }
                
                .text-input {
                    -webkit-app-region: no-drag;
                    position: relative;
                    font-size: inherit;
                    font-weight: inherit;
                    min-width: 0;
                    width: 100%;
                    padding: 10px 20px;
                    padding-right: 35px;
                    border: none;
                    outline: none;
                    background-color: rgba(255, 255, 255, .1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    border-radius: 9999px;
                    transition: background-color 67ms linear;
                }

                .text-input:hover,
                .text-input:focus {
                    background-color: rgba(255, 255, 255, .2);
                }

                .text-input[disabled] {
                    opacity: .5;
                    pointer-events: none;
                }

                .text-input::placeholder {
                    color: rgba(255, 255, 255, .5);
                }

                .clear-input {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    cursor: pointer;
                    background-color: rgb(255, 255, 255, .1);
                    color: rgba(255, 255, 255, .5);
                    border-radius: 9999px;
                    transition: all 250ms ease, background-color 67ms linear;
                }

                :host:host-context(body[reduced-motion]) .clear-input {
                    transition-duration: 0ms;
                }

                .clear-input:hover,
                .clear-input:active {
                    background-color: rgba(255, 255, 255, .2);
                    color: rgba(255, 255, 255, .8);
                }

                .clear-input.hidden {
                    opacity: 0;
                    transform: translateX(50px) scale(.5);
                }
            </style>

            ${this.label ? `<p class="label">${this.label}</p>` : ""}
            <div class="text-input-container">
                <input class="text-input" ${this.disabled ? "disabled" : ""} ${this.censored ? "type='password'" : "type='text'"} ${this.valueAttr} ${this.placeholderAttr} spellcheck="false" autocomplete="off">
                <span class="clear-input hidden"><span class="icons">&#xE894;</span></span>
            </div>
        `;

        this.textInputElement = shadow.querySelector("input");
        this.clearInputElement = shadow.querySelector(".clear-input");

        this.setupEventListeners();
    }

    connectedCallback() {
        this.value = this.textInputElement.value;

        const textInputRect = this.textInputElement.getBoundingClientRect();
        const clearInputSize = 25;
        const clearInputOffset = Math.round(Math.round(textInputRect.height) / 2 - clearInputSize / 2);

        this.clearInputElement.style.width = `${clearInputSize}px`;
        this.clearInputElement.style.height = `${clearInputSize}px`;
        this.clearInputElement.style.right = `${clearInputOffset}px`;
        this.clearInputElement.style.top = `${clearInputOffset}px`;
    }

    setupEventListeners() {
        this.textInputElement.addEventListener("input", () => {
            if (this.textInputElement.value.length > 0) {
                this.clearInputElement.classList.remove("hidden");
            }
            else {
                this.clearInputElement.classList.add("hidden");
                return;
            }

            this.value = this.textInputElement.value;
        });

        this.clearInputElement.addEventListener("click", () => {
            this.textInputElement.value = "";
            this.value = "";
            this.clearInputElement.classList.add("hidden");
            this.focus();
            this._inputEvent();
        });
    }

    setValue(value) {
        this.value = value;
        this.textInputElement.value = value;
        this._inputEvent();
    }

    focus() {
        this.textInputElement.focus();
    }

    toggleDisable() {
        this.disabled = !this.disabled;
        this.textInputElement.disabled = this.disabled;
    }

    _inputEvent() {
        this.textInputElement.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    }
}

class Switch extends HTMLElement {
    constructor() {
        super();

        this.checked = this.hasAttribute("checked");
        this.disabled = this.hasAttribute("disabled");

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
            <style>
                ${globalStyles}

                :host {
                    width: max-content;
                    height: max-content;
                    font-size: inherit;
                    font-weight: inherit;
                    display: flex;
                }

                .container {
                    -webkit-app-region: no-drag;
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    flex-shrink: 0;
                    width: 52px;
                    height: 32px;
                    border-radius: 9999px;
                    cursor: pointer;
                    outline: none;
                }

                .container:has(input[disabled]) {
                    opacity: .5;
                    pointer-events: none;
                }

                .track {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    border-radius: inherit;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .track::before {
                    content: "";
                    display: flex;
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    border-radius: inherit;
                    box-sizing: border-box;
                    transform-property: opacity, background-color;
                    transition-timing-function: linear;
                    transition-duration: 67ms;
                    background-color: transparent;
                    border-color: rgba(255, 255, 255, .75);
                    border-style: solid;
                    border-width: 2px;
                }

                .container[checked] .track::before {
                    background-color: rgb(255, 255, 255);
                    border-color: rgb(255, 255, 255);
                }

                .handle-container {
                    display: flex;
                    place-content: center;
                    place-items: center;
                    position relative;
                    transition: margin 300ms cubic-bezier(.175, .885, .32, 1.275);
                    margin-inline-end: 20px;
                }

                :host:host-context(body[reduced-motion]) .handle-container {
                    transition-duration: 67ms;
                }

                .container[checked] .handle-container {
                    margin-inline-end: 0px;
                    margin-inline-start: 20px;
                }

                .handle {
                    position: relative;
                    border-radius: 9999px;
                    height: 16px;
                    width: 16px;
                    transform-origin: center center;
                    transition-property: height, width;
                    transition-duration: 250ms, 250ms;
                    transition-timing-function:
                        cubic-bezier(.2, 0, 0, 1),
                        cubic-bezier(.2, 0, 0, 1);
                    z-index: 0;
                }

                :host:host-context(body[reduced-motion]) .handle {
                    transition-duration: 67ms;
                }

                .container[checked] .handle {
                    width: 24px;
                    height: 24px;
                }

                .container:active .handle {
                    width: 28px;
                    height: 28px;
                }

                .handle::before {
                    content: "";
                    display: flex;
                    inset: 0px;
                    position: absolute;
                    border-radius: inherit;
                    box-sizing: border-box;
                    transition: background-color 67ms linear;
                    background-color: rgba(255, 255, 255, .75);
                }

                .container:hover .handle::before,
                .container:active .handle::before {
                    background-color: white;
                }
                
                .container[checked] .handle::before {
                    background-color: rgb(30, 30, 30);
                }

                .container[checked]:hover .handle::before {
                    background-color: rgb(40, 40, 40);
                }
            </style>

            <div class="container" ${this.checked ? "checked" : ""}>
                <span class="track">
                    <span class="handle-container">
                        <span class="handle"></span>
                    </span>
                </span>
            </div>
        `;

        this.EVENTS = {
            TOGGLE: {
                name: "ascended-switch-toggle",
                event: new CustomEvent("ascended-switch-toggle", { bubbles: true, composed: true }),
            },
            BEFORE_TOGGLE: {
                name: "ascended-switch-before-toggle",
                event: new CustomEvent("ascended-switch-before-toggle", { bubbles: true, composed: true }),
            },
        }

        this.containerElement = shadow.querySelector(".container");
        this.toggleCancellation = false;

        this.addEventListener("click", () => {
            this.dispatchEvent(this.EVENTS.BEFORE_TOGGLE.event);

            if (!this.toggle()) {
                return;
            }

            this.dispatchEvent(this.EVENTS.TOGGLE.event);
        });
    }

    focus() {
        this.containerElement.focus();
    }

    _toggle(value) {
        if (this.disabled) {
            return;
        }
        if (this.toggleCancellation) {
            this.toggleCancellation = false;
            return;
        }
        this.checked = value;
        this.toggleAttribute("checked", this.checked);
        this.containerElement.toggleAttribute("checked", this.checked);
    }

    toggle(value) {
        const validValue = value != undefined && typeof value === "boolean";
        if (validValue) {
            this._toggle(value);
        }
        else {
            this._toggle(!this.checked);
        }
        return this.checked;
    }

    toggleDisable() {
        this.disabled = !this.disabled;
        this.switchElement.disabled = this.disabled;
    }

    cancelToggle() {
        this.toggleCancellation = true;
    }
}

class Slider extends HTMLElement {
    constructor() {
        super();

        this.label = this.hasAttribute("label") ? this.getAttribute("label") : "";
        this.min = this.hasAttribute("min") ? parseFloat(this.getAttribute("min")) : 0;
        this.max = this.hasAttribute("max") ? parseFloat(this.getAttribute("max")) : 100;
        this.value = this.hasAttribute("value") ? parseFloat(this.getAttribute("value")) : this.min;
        this.disabled = this.hasAttribute("disabled");
        this.useFloat = this.hasAttribute("float");
        
        this.value = Math.max(this.min, Math.min(this.max, this.value));
        this.suffix = this.hasAttribute("suffix") ? this.getAttribute("suffix") : "";

        this.hasSteps = this.hasAttribute("step");
        this.step = this.hasSteps ? parseFloat(this.getAttribute("step")) : 1;
        
        this.value = this.formatValue(this.value);
        
        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
            <style>
                ${globalStyles}

                :host {
                    display: flex;
                    flex-direction: column;
                    font-size: inherit;
                    font-weight: inherit;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                    padding-inline: 10px;
                }

                .header {
                    display: flex;
                    align-items: center;
                    justify-content: right;
                    padding-inline: 5px;
                }

                .label {
                    font-size: inherit;
                    color: rgba(255, 255, 255, .75);
                    margin-right: auto;
                }
                
                .value-display {
                    color: white;
                    font-size: 0.9em;
                }
                
                .slider-container {
                    -webkit-app-region: no-drag;
                    position: relative;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }
                
                .slider-container[disabled] {
                    opacity: .5;
                    pointer-events: none;
                }
                
                .track {
                    position: relative;
                    width: 100%;
                    height: 4px;
                    background-color: rgba(255, 255, 255, .1);
                    border-radius: 9999px;
                    overflow: visible;
                    transition: background-color 67ms linear;
                }
                
                .slider-container:hover .track {
                    background-color: rgba(255, 255, 255, .2);
                }
                
                .filled-track {
                    position: absolute;
                    height: 100%;
                    background-color: rgb(205, 205, 205);
                    border-radius: 9999px;
                    transition: background-color 67ms linear;
                }
                
                :host:host-context(body[reduced-motion]) .filled-track {
                    transition-duration: 67ms;
                }
                
                .slider-container:hover .filled-track {
                    background-color: rgb(255, 255, 255);
                }

                .slider-container:active .filled-track {
                    background-color: rgb(255, 255, 255);
                }
                
                .handle {
                    position: absolute;
                    top: 50%;
                    height: 16px;
                    width: 16px;
                    border-radius: 9999px;
                    background-color: rgb(205, 205, 205);
                    transform: translate(-50%, -50%);
                    transform-origin: center center;
                    transition: transform 250ms cubic-bezier(.2, 0, 0, 1), background-color 67ms linear;
                    z-index: 1;
                }
                
                :host:host-context(body[reduced-motion]) .handle {
                    transition-duration: 67ms;
                }
                
                .slider-container:hover .handle {
                    background-color: rgb(255, 255, 255);
                }
                
                .slider-container:active .handle {
                    background-color: rgb(255, 255, 255);
                    transform: translate(-50%, -50%) scale(1.25);
                }
                
                .steps-container {
                    position: absolute;
                    top: 50%;
                    width: 100%;
                    height: 4px;
                    transform: translateY(-50%);
                    pointer-events: none;
                }
                
                .step-mark {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background-color: rgba(255, 255, 255, .5);
                    border-radius: 50%;
                    transform: translate(-50%, 0);
                }
            </style>

            <div class="container">
                <div class="header">
                    ${this.label ? `<div class="label">${this.label}</div>` : ""}
                    <span class="value-display">${this.value}${this.suffix ? this.suffix : ""}</span>
                </div>
                <div class="slider-container" ${this.disabled ? "disabled" : ""}>
                    <div class="track">
                        <div class="filled-track"></div>
                        <div class="handle"></div>
                        ${this.hasSteps ? `<div class="steps-container"></div>` : ""}
                    </div>
                </div>
            </div>
        `;

        this.EVENTS = {
            CHANGE: {
                name: "ascended-slider-change",
                event: new CustomEvent("ascended-slider-change", { 
                    bubbles: true, 
                    composed: true,
                    detail: { value: this.value }
                }),
            },
            INPUT: {
                name: "ascended-slider-input",
                event: new CustomEvent("ascended-slider-input", { 
                    bubbles: true, 
                    composed: true,
                    detail: { value: this.value }
                }),
            }
        };

        this.sliderContainer = shadow.querySelector(".slider-container");
        this.track = shadow.querySelector(".track");
        this.filledTrack = shadow.querySelector(".filled-track");
        this.handle = shadow.querySelector(".handle");
        this.valueDisplay = shadow.querySelector(".value-display");
        this.stepsContainer = shadow.querySelector(".steps-container");

        this.setupEventListeners();
    }

    connectedCallback() {
        this.updateSliderPosition();

        if (this.hasSteps) {
            this.renderStepMarks();
        }
    }

    formatValue(val) {
        if (!this.useFloat) {
            return Math.round(val);
        } else {
            return parseFloat(val.toFixed(3));
        }
    }

    setupEventListeners() {
        let isDragging = false;

        const startDrag = (e) => {
            if (this.disabled) return;
            isDragging = true;
            this.sliderContainer.classList.add("active");
            updateFromPointer(e);
        };

        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            this.sliderContainer.classList.remove("active");
            
            this.dispatchChangeEvent();
        };

        const drag = (e) => {
            if (!isDragging) return;
            updateFromPointer(e);
            e.preventDefault();
        };

        const updateFromPointer = (e) => {
            const rect = this.track.getBoundingClientRect();
            let percentage = (e.clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            
            this.setValueFromPercentage(percentage);
            this.updateSliderPosition();
            
            this.dispatchInputEvent();
        };

        this.sliderContainer.addEventListener("mousedown", startDrag);
        this.sliderContainer.addEventListener("touchstart", (e) => startDrag(e.touches[0]));
        
        window.addEventListener("mousemove", drag);
        window.addEventListener("touchmove", (e) => drag(e.touches[0]));
        
        window.addEventListener("mouseup", stopDrag);
        window.addEventListener("touchend", stopDrag);
        window.addEventListener("touchcancel", stopDrag);

        this.track.addEventListener("click", updateFromPointer);
    }

    setValueFromPercentage(percentage) {
        let rawValue = this.min + percentage * (this.max - this.min);
        
        if (this.hasSteps) {
            rawValue = Math.round(rawValue / this.step) * this.step;
        }
        
        rawValue = this.formatValue(rawValue);
        
        this.value = Math.max(this.min, Math.min(this.max, rawValue));
        
        this.updateDisplayedValue();
    }

    updateDisplayedValue() {
        if (this.valueDisplay) {
            this.valueDisplay.textContent = `${this.value}${this.suffix ? this.suffix : ""}`;
        }
    }

    updateSliderPosition() {
        const percentage = (this.value - this.min) / (this.max - this.min);
        
        this.filledTrack.style.width = `${percentage * 100}%`;
        this.handle.style.left = `${percentage * 100}%`;
    }

    renderStepMarks() {
        this.stepsContainer.innerHTML = "";
        
        const totalSteps = Math.floor((this.max - this.min) / this.step) + 1;
        
        for (let i = 1; i < totalSteps - 1; i++) {
            const stepMark = document.createElement("div");
            stepMark.classList.add("step-mark");
            
            const percentage = (i * this.step) / (this.max - this.min);
            stepMark.style.left = `${percentage * 100}%`;
            
            this.stepsContainer.appendChild(stepMark);
        }
    }

    dispatchChangeEvent() {
        const changeEvent = new CustomEvent(this.EVENTS.CHANGE.name, {
            bubbles: true,
            composed: true,
            detail: { value: this.value }
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchInputEvent() {
        const inputEvent = new CustomEvent(this.EVENTS.INPUT.name, {
            bubbles: true,
            composed: true,
            detail: { value: this.value }
        });
        this.dispatchEvent(inputEvent);
    }

    setValue(value) {
        let newValue = parseFloat(value);
        
        newValue = this.formatValue(newValue);
        
        newValue = Math.max(this.min, Math.min(this.max, newValue));
        
        if (this.value !== newValue) {
            this.value = newValue;
            
            this.updateDisplayedValue();
            this.updateSliderPosition();
            
            this.dispatchChangeEvent();
        }
    }

    toggleDisable() {
        this.disabled = !this.disabled;
        this.sliderContainer.toggleAttribute("disabled", this.disabled);
    }

    toggleFloat(useFloat) {
        this.useFloat = useFloat !== undefined ? useFloat : !this.useFloat;
        
        this.value = this.formatValue(this.value);
        
        this.updateDisplayedValue();
    }

    focus() {
        this.sliderContainer.focus();
    }

    setMin(min) {
        this.min = parseFloat(min);
        if (this.value < this.min) {
            this.setValue(this.min);
        }
        this.updateSliderPosition();
        
        if (this.hasSteps) {
            this.renderStepMarks();
        }
    }

    setMax(max) {
        this.max = parseFloat(max);
        if (this.value > this.max) {
            this.setValue(this.max);
        }
        this.updateSliderPosition();
        
        if (this.hasSteps) {
            this.renderStepMarks();
        }
    }

    setStep(step) {
        this.step = parseFloat(step);
        this.hasSteps = true;
        this.renderStepMarks();
        
        const percentage = (this.value - this.min) / (this.max - this.min);
        this.setValueFromPercentage(percentage);
        this.updateSliderPosition();
    }
}

customElements.define("ascended-container", Container);
customElements.define("ascended-button", Button);
customElements.define("ascended-text-input", TextInput);
customElements.define("ascended-switch", Switch);
customElements.define("ascended-slider", Slider);