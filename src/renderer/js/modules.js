import { checkRippleElements } from "./modules/ripples.js";
import { checkTooltipElements } from "./modules/tooltips.js";

export function initializeModules(wrapper) {
    console.log("(MODULES) Initializing...");

    checkRippleElements();
    checkTooltipElements();

    console.log("(MODULES) Done!");
}