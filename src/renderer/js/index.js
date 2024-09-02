import { SearchBar } from "./modules/searchbar.js";
import { createProjectsFolderFn, createProjectFn, openProjectsFolderFn, openTerminalFn } from "./modules/preload_functions.js";
import { updateProjects } from "./modules/projects.js";

// Variables

const quitBtn = document.getElementById("quit");
const minimizeBtn = document.getElementById("minimize");
const createProjectBtn = document.getElementById("create");
const refreshProjectsBtn = document.getElementById("refresh");
const openProjectsFolderBtn = document.getElementById("openFolder");
const terminalBtn = document.getElementById("terminal");
const searchBar = document.getElementById("search");
const search = new SearchBar(searchBar);
const projects = document.querySelector(".projects");

// Event listeners

quitBtn.addEventListener("click", async (event) => {
    await window.electronAPI.quit();
});

minimizeBtn.addEventListener("click", async (event) => {
    await window.electronAPI.minimize();
});

createProjectBtn.addEventListener("click", () => {
    const search = document.getElementById("search");
    if (search.value) {
        createProjectFn(search.value);
        search.focus();
        updateProjects();
    }
});

refreshProjectsBtn.addEventListener("click", () => {
    updateProjects();
});

openProjectsFolderBtn.addEventListener("click", () => {
    openProjectsFolderFn();
});

terminalBtn.addEventListener("click", () => {
    openTerminalFn();
});

// Initialization

window.electronAPI.onResetScroll(() => {
    if (projects) {
        projects.scrollTop = 0;
    }
});

searchBar.focus();

search.initialize(projects);

createProjectsFolderFn();
updateProjects();