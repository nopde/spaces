import { renameModal, deleteModal } from "./modals.js";
import { codeProjectFn, openProjectFolderFn, getProjects, openTerminalFn } from "./preload_functions.js";
import { initializeModules } from "../modules.js";

export const updateProjects = async () => {
    const projects = await getProjects();

    const projectsContainer = document.querySelector(".projects");
    projectsContainer.innerHTML = "";

    projectsContainer.addEventListener("initialize-modules", () => {
        initializeModules(document.querySelector(".wrapper"));
    });

    projects.forEach(projectName => {
        const spaceHTML = `
            <div class="project" id="${projectName}" ripple>
                <p>${projectName}</p>
                <button id="${projectName} rename" tooltip data-tooltip="Edit" ripple><span class="material-symbols-outlined">edit</span></button>
                <button id="${projectName} delete" tooltip data-tooltip="Delete" ripple><span class="material-symbols-outlined">delete</span></button>
                <button id="${projectName} openFolder" tooltip data-tooltip="Open folder" ripple><span class="material-symbols-outlined">folder_open</span></button>
                <button id="${projectName} openTerminal" tooltip data-tooltip="Open terminal" ripple><span class="material-symbols-outlined">terminal</span></button>
            </div>
        `;
        const projectContainer = document.createElement("div");

        projectContainer.innerHTML = spaceHTML;

        const project = projectContainer.querySelector(":scope > .project");

        projectsContainer.appendChild(project);

        const renameBtn = document.getElementById(`${projectName} rename`);
        const deleteBtn = document.getElementById(`${projectName} delete`);
        const openFolderBtn = document.getElementById(`${projectName} openFolder`);
        const openTerminalBtn = document.getElementById(`${projectName} openTerminal`);

        renameBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            renameModal(projectName);
        });

        deleteBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            deleteModal(projectName);
        });

        openFolderBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openProjectFolderFn(projectName);
        });

        openTerminalBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openTerminalFn(projectName);
        });

        project.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            codeProjectFn(projectName);
        });
    });

    initializeModules(document.querySelector(".wrapper"));

    const searchBar = document.getElementById("search");
    const inputEvent = new Event("input", {
        bubbles: true,
        cancelable: true,
    });

    searchBar.dispatchEvent(inputEvent);
}