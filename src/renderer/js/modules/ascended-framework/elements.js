import { globalStyles, RippleHandler } from "./utils.js";

class Button extends HTMLElement {
    constructor() {
        super();

        this.content = this.innerHTML;
        this.accent = this.hasAttribute("accent");
        this.disabled = this.hasAttribute("disabled");

        this.elevated = this.hasAttribute("elevated");
        this.accentColor = this.hasAttribute("accent-color") ? this.getAttribute("accent-color") : "255, 255, 255";

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
                    transition:
                        background-color 67ms linear,
                        color 67ms linear,
                        filter 67ms linear;
                }

                .button:hover,
                .button:hover:active {
                    background-color: rgba(255, 255, 255, .2);
                }

                .button.accent {
                    background-color: rgb(${this.accentColor});
                    color: rgb(30, 30, 30);
                }

                .button.accent:hover,
                .button.accent:hover:active {
                    background-color: rgb(${this.accentColor});
                    filter: brightness(0.85);
                }

                :host:host-context(body:not([ripples])) .button:hover:active {
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

            <button class="button ${this.accent ? "accent" : ""}" ${this.disabled ? "disabled" : ""} ${this.elevated ? "elevated" : ""}>${this.content}</button>
        `;

        this.EVENTS = {
            CLICK: {
                name: "ascended-button-click",
                event: new CustomEvent("ascended-button-click", { bubbles: true, composed: true }),
            }
        }

        this.buttonElement = shadow.querySelector("button");

        this.setupEventListeners();

        const rippleColor = this.accent ? "0, 0, 0" : "255, 255, 255";
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

                .text-input-container:has(.clear-input:hover) .text-input {
                    background-color: rgba(255, 255, 255, .1);
                }

                .text-input[disabled] {
                    opacity: .5;
                    pointer-events: none;
                }

                .text-input::placeholder {
                    color: rgba(255, 255, 255, .5);
                }

                .clear-input {
                    --scale: 0;
                    position: absolute;
                    top: 50%;
                    right: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    cursor: pointer;
                    background-color: rgb(255, 255, 255, .1);
                    color: rgba(255, 255, 255, .5);
                    border-radius: 9999px;
                    translate: 0 -50%;
                    transition:
                        all 250ms cubic-bezier(.175, .885, .32, 1.275),
                        background-color 67ms linear;
                }

                .clear-input:hover {
                    background-color: rgba(255, 255, 255, .2);
                    color: rgba(255, 255, 255, .8);
                    scale: var(--scale);
                }

                .clear-input:hover:active {
                    background-color: rgba(255, 255, 255, .3);
                }

                .clear-input.hidden {
                    opacity: 0;
                    transform: translateX(20px) scale(0);
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

        const textInputHeight = this.textInputElement.getBoundingClientRect().height;
        const clearInputSize = Math.round(textInputHeight) - 10;
        const scale = textInputHeight / clearInputSize;

        this.clearInputElement.style.width = `${clearInputSize}px`;
        this.clearInputElement.style.height = `${clearInputSize}px`;

        this.clearInputElement.style.setProperty("--scale", scale);
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

        this.accentColor = this.hasAttribute("accent-color") ? this.getAttribute("accent-color") : "255, 255, 255";

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
                    border-color: rgba(${this.accentColor}, .75);
                    border-style: solid;
                    border-width: 2px;
                }

                .container[checked] .track::before {
                    background-color: rgb(${this.accentColor});
                    border-color: rgb(${this.accentColor});
                }

                .handle-container {
                    display: flex;
                    place-content: center;
                    place-items: center;
                    position relative;
                    transition: margin 300ms cubic-bezier(.175, .885, .32, 1.275);
                    margin-inline-end: 20px;
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
                    background-color: rgba(${this.accentColor}, .75);
                }

                .container:hover .handle::before,
                .container:active .handle::before {
                    background-color: rgb(${this.accentColor});
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
            this._toggle(!this.checked);
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

        this.accentColor = this.hasAttribute("accent-color") ? this.getAttribute("accent-color") : "255, 255, 255";

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
                    gap: 5px;
                }

                .header {
                    display: flex;
                    align-items: center;
                    justify-content: right;
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
                    display: flex;
                    width: 100%;
                    height: 12px;
                    border-radius: 9999px;
                }

                .fake-track {
                    position: absolute;
                    right: 0;
                    z-index: 1;
                    width: 100%;
                    height: 100%;
                    border-radius: 15px;
                    background-color: rgba(${this.accentColor}, .08);
                    overflow: hidden;
                    transition: background-color 67ms linear;
                }

                .slider-container:hover .fake-track {
                    background-color: rgba(${this.accentColor}, .12);
                }
                
                .filled-track {
                    position: absolute;
                    z-index: 1;
                    height: 100%;
                    background-color: rgb(${this.accentColor}, 255);
                    border-radius: 15px;
                }
                
                .handle {
                    position: absolute;
                    top: 50%;
                    height: 32px;
                    width: 4px;
                    border-radius: 9999px;
                    background-color: rgba(${this.accentColor}, .85);
                    transform: translate(-50%, -50%);
                    transform-origin: center center;
                    transition: width 250ms cubic-bezier(.175, .885, .32, 1.275), background-color 67ms linear;
                    z-index: 2;
                }
                
                .slider-container:hover .handle {
                    background-color: rgb(${this.accentColor});
                    width: 6px;
                }
                
                .slider-container:active .handle {
                    background-color: rgb(${this.accentColor});
                    width: 2px;
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
                        <div class="fake-track"></div>
                        <div class="handle"></div>
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
        this.fakeTrack = shadow.querySelector(".fake-track");
        this.filledTrack = shadow.querySelector(".filled-track");
        this.handle = shadow.querySelector(".handle");
        this.valueDisplay = shadow.querySelector(".value-display");

        this.trackWidth = this.track.getBoundingClientRect().width;
        this.handleWidth = this.handle.getBoundingClientRect().width;

        this.setupEventListeners();
        this.updateSliderPosition(false);
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

        this.sliderContainer.addEventListener("mousedown", () => {
            this.handle.classList.add("active");
            this.updateSliderPosition();
        });

        window.addEventListener("mouseup", () => {
            if (!this.handle.classList.contains("active")) {
                return;
            }

            this.handle.classList.remove("active");
            this.updateSliderPosition();
        });

        window.addEventListener("mousecancel", () => {
            if (!this.handle.classList.contains("active")) {
                return;
            }

            this.handle.classList.remove("active");
            this.updateSliderPosition();
        });

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

    updateSliderPosition(animations = true) {
        const percentage = (this.value - this.min) / (this.max - this.min);
        const handlePosition = this.trackWidth * percentage;
        const gap = this.handle.classList.contains("active") ? "7px" : "10px";

        if (!animations) {
            this.filledTrack.style.width = `calc(${percentage * 100}% - ${gap})`;
            this.fakeTrack.style.width = `calc(${(1 - percentage) * 100}% - ${gap})`;
            this.handle.style.translate = `${handlePosition}px 0px`;
            return;
        }

        const bounceEasing = "cubic-bezier(.175, .885, .32, 1.275)";
        const animationDuration = 500;

        const filledTrackAnimation = this.filledTrack.animate([
            { width: `calc(${percentage * 100}% - ${gap})` }
        ], {
            duration: animationDuration,
            easing: bounceEasing,
            fill: "forwards",
        });

        const fakeTrackAnimation = this.fakeTrack.animate([
            { width: `calc(${(1 - percentage) * 100}% - ${gap})` },
        ], {
            duration: animationDuration,
            easing: bounceEasing,
            fill: "forwards",
        });

        const handleAnimation = this.handle.animate([
            { translate: `${handlePosition}px 0px` }
        ], {
            duration: animationDuration,
            easing: bounceEasing,
            fill: "forwards",
        });

        const animationsFinished = Promise.all([
            filledTrackAnimation.finished,
            fakeTrackAnimation.finished,
            handleAnimation.finished,
        ]);

        return animationsFinished;
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
    }

    setMax(max) {
        this.max = parseFloat(max);
        if (this.value > this.max) {
            this.setValue(this.max);
        }
        this.updateSliderPosition();
    }

    setStep(step) {
        this.step = parseFloat(step);
        this.hasSteps = true;

        const percentage = (this.value - this.min) / (this.max - this.min);
        this.setValueFromPercentage(percentage);
        this.updateSliderPosition();
    }
}

class SelectableList extends HTMLElement {
    constructor() {
        super();

        this.items = this.hasAttribute("items") ? this.getAttribute("items").split(",") : [];
        this.selectedItem = this.hasAttribute("selected") ? this.getAttribute("selected") : this.items[0];

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
            <style>
                ${globalStyles}

                :host {
                    font-size: inherit;
                    font-weight: inherit;
                    border: 1px solid rgba(255, 255, 255, .1);
                    border-radius: 10px;
                    overflow-y: auto;
                }

                :host::-webkit-scrollbar {
                    display: none;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                }

                .selectable-item {
                    padding: 0 20px;
                    cursor: pointer;
                    color: rgba(255, 255, 255, .75);
                    overflow: hidden;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    border-radius: 9999px;
                    background-color: rgba(255, 255, 255, .05);
                    margin-bottom: 5px;
                    transition: all 67ms linear;
                }

                .selectable-item span {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    pointer-events: none;
                }

                .selectable-items-container {
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                }

                .selectable-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }

                .selectable-item:hover,
                .selectable-item:active {
                    background-color: rgba(255, 255, 255, .1);
                    color: rgb(255, 255, 255);
                }

                .selectable-item[selected] {
                    background-color: rgb(208, 188, 255);
                    color: rgb(30, 30, 30);
                    box-shadow: 0 2px 5px rgb(0, 0, 0, .25);
                }

                .search-container {
                    position: sticky;
                    z-index: 5;
                    top: 0;
                    padding: 10px;
                    background-color: rgb(30, 30, 35);
                    border-bottom: 1px solid rgba(255, 255, 255, .1);
                }
            </style>

            <div class="container">
                <div class="search-container">
                    <ascended-text-input placeholder="Search..."></ascended-text-input>
                </div>
                <div class="selectable-items-container">
                    ${this.items.map((item, index) => `
                        <div class="selectable-item" ${this.selectedItem === item ? "selected" : ""}><span>${item}</span></div>
                    `).join("")}
                </div>
            </div>
        `;

        this.itemsContainer = shadow.querySelector(".selectable-items-container");
        this.selectedItem = shadow.querySelector(`.selectable-item[selected]`);
        this.searchInput = shadow.querySelector("ascended-text-input");

        this.containerElement = shadow.querySelector(".container");

        this.setupEventListeners();
    }

    focusSearch() {
        this.searchInput.focus();
    }

    _filterItems() {
        const searchText = this.searchInput.textInputElement.value.trim().toLowerCase();
        const selectedItemText = this.selectedItem.textContent.trim().toLowerCase();
        const searchWords = searchText.split(" ").filter(word => word !== "");

        this.itemsContainer.innerHTML = "";

        this.items.forEach((item) => {
            const itemText = item.toLowerCase();
            let match = true;

            searchWords.forEach(word => {
                if (!itemText.includes(word)) {
                    match = false;
                }
            });

            if (match) {
                this.itemsContainer.innerHTML += `<div class="selectable-item" ${selectedItemText === itemText ? "selected" : ""}><span>${item}</span></div>`;
            }
        });
    }

    setupEventListeners() {
        this.containerElement.addEventListener("click", (e) => {
            const target = e.target;
            if (target.classList.contains("selectable-item")) {
                this.selectedItem.toggleAttribute("selected", false);
                this.selectedItem = target;
                this.selectedItem.toggleAttribute("selected", true);
            }
        });

        this.searchInput.textInputElement.addEventListener("input", () => this._filterItems());
    }
}

customElements.define("ascended-button", Button);
customElements.define("ascended-text-input", TextInput);
customElements.define("ascended-switch", Switch);
customElements.define("ascended-slider", Slider);
customElements.define("ascended-selectable-list", SelectableList);