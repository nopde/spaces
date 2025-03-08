import { SearchBar } from "./modules/searchbar.js";
import { createProjectsFolderFn, createProjectFn, openProjectsFolderFn, openTerminalFn } from "./modules/preload_functions.js";
import { updateProjects } from "./modules/projects.js";
import { Modal } from "./modules/ascended-framework/modal.js";

// Variables

let currentConfig = null;

const quitBtn = document.getElementById("quit");
const minimizeBtn = document.getElementById("minimize");
const refreshProjectsBtn = document.getElementById("refresh");
const openProjectsFolderBtn = document.getElementById("openFolder");
const terminalBtn = document.getElementById("terminal");
const configurationBtn = document.getElementById("configuration");
const searchBar = document.getElementById("search").textInputElement;
const search = new SearchBar(searchBar);
const projects = document.querySelector(".projects");

// Event listeners

quitBtn.addEventListener("click", async (event) => {
    await window.electronAPI.quit();
});

minimizeBtn.addEventListener("click", async (event) => {
    await window.electronAPI.minimize();
});

refreshProjectsBtn.addEventListener("click", async () => {
    await updateProjects();
});

openProjectsFolderBtn.addEventListener("click", () => {
    openProjectsFolderFn();
});

terminalBtn.addEventListener("click", () => {
    openTerminalFn();
});

configurationBtn.addEventListener("click", async () => {
    const modal = new Modal(
        "Configuration",
        `
            <style>
                .section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .section:last-child {
                    margin-bottom: 0;
                }

                .section .title {
                    font-size: 21px;
                    font-weight: 500;
                    margin-bottom: 5px;
                }

                .separator {
                    width: 100%;
                    height: 1px;
                    background-color: rgb(45, 45, 50);
                }

                .switch-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    font-size: 16px;
                }

                #change-projects-folder {
                    width: 100%;
                }
            </style>

            <div class="section">
                <div class="title">General</div>
                <div class="switch-container">
                    <p>Reduced motion</p>
                    <ascended-switch id="reduced-motion"></ascended-switch>
                </div>
                <div class="separator"></div>
                <div class="switch-container">
                    <p>Ripples</p>
                    <ascended-switch id="ripples"></ascended-switch>
                </div>
                <div class="separator"></div>
                <div class="switch-container">
                    <p>Open projects on creation</p>
                    <ascended-switch id="open-projects-on-creation"></ascended-switch>
                </div>
            </div>
            <div class="section">
                <p class="title">Advanced</p>
                <ascended-text-input id="code-editor-command" placeholder="Code" label="Code editor command"></ascended-text-input>
                <div class="separator"></div>
                <ascended-button id="change-projects-folder">Change projects folder</ascended-button>
            </div>
        `,
        [
            "<ascended-button cancel>Cancel</ascended-button>",
            "<ascended-button action primary primary-color='208, 188, 255'>Save</ascended-button>",
        ],
        null,
        true,
    );

    const config = await window.electronAPI.getConfig();

    const root = modal.modalContent.shadowRoot;

    const reducedMotionSwitch = root.querySelector("#reduced-motion");
    const ripplesSwitch = root.querySelector("#ripples");
    const openProjectsOnCreationSwitch = root.querySelector("#open-projects-on-creation");
    const codeEditorCommandInput = root.querySelector("#code-editor-command");
    const changeProjectsFolderBtn = root.querySelector("#change-projects-folder");

    reducedMotionSwitch.toggle(config.reducedMotion);
    ripplesSwitch.toggle(config.ripples);
    openProjectsOnCreationSwitch.toggle(config.openProjectsOnCreation);
    codeEditorCommandInput.setValue(config.codeEditorCommand);

    changeProjectsFolderBtn.addEventListener("ascended-button-click", async () => {
        const modal = new Modal(
            "Change projects folder",
            `
                <style>
                    ascended-button {
                        width: 100%;
                    }
                </style>

                <ascended-text-input id="projects-folder-input" type="text" placeholder="New folder path" required></ascended-text-input>
                <ascended-button id="select-folder" primary primary-color="208, 188, 255">Select folder from explorer</ascended-button>
                <ascended-button id="reset-to-default">Reset to default</ascended-button>
            `,
            [
                "<ascended-button cancel>Cancel</ascended-button>",
                "<ascended-button action primary primary-color='208, 188, 255'>Change</ascended-button>",
            ],
            null,
            true,
        );
        const modalInput = modal.modalContent.shadowRoot.querySelector("#projects-folder-input");
        const selectFolderBtn = modal.modalContent.shadowRoot.querySelector("#select-folder");
        const resetToDefaultBtn = modal.modalContent.shadowRoot.querySelector("#reset-to-default");

        selectFolderBtn.addEventListener("ascended-button-click", async () => {
            const folderPath = await window.electronAPI.selectFolder(config.projectsFolder);
            if (folderPath) {
                modalInput.setValue(folderPath);
            }
        });

        resetToDefaultBtn.addEventListener("ascended-button-click", async () => {
            modalInput.setValue(config.defaultProjectsFolder);
        });

        modal.show();
        modalInput.setValue(config.projectsFolder);
        modalInput.focus();

        modal.addEventListener(modal.EVENTS.ASK_EXIT.name, async () => {
            const newProjectsFolder = modalInput.value;
            if (newProjectsFolder.length === 0 || newProjectsFolder === config.projectsFolder) {
                modal.authorizeExit();
                return;
            }

            config.projectsFolder = newProjectsFolder;

            await window.electronAPI.updateConfig(config);
            await updateProjects();
            
            modal.authorizeExit();
        });
    });

    modal.addEventListener(modal.EVENTS.ASK_EXIT.name, async () => {
        config.reducedMotion = reducedMotionSwitch.checked;
        config.ripples = ripplesSwitch.checked;
        config.openProjectsOnCreation = openProjectsOnCreationSwitch.checked;
        if (codeEditorCommandInput.value) {
            config.codeEditorCommand = codeEditorCommandInput.value;
        }

        await window.electronAPI.updateConfig(config);
        await updateProjects();

        modal.authorizeExit();
    });

    modal.show();
});

function applyConfig() {
    document.body.toggleAttribute("reduced-motion", currentConfig.reducedMotion);
    document.body.toggleAttribute("ripples", currentConfig.ripples);
}

// Initialization

currentConfig = await window.electronAPI.getConfig();
applyConfig();

window.electronAPI.onResetScroll(() => {
    if (projects) {
        projects.scrollTop = 0;
    }
});

window.electronAPI.onConfigChange((newConfig) => {
    currentConfig = newConfig;
    applyConfig();
});

searchBar.focus();

searchBar.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        if (searchBar.value) {
            createProjectFn(searchBar.value);
            await updateProjects();
            searchBar.focus();
            searchBar.dispatchEvent(new Event("input"));
        }
    }
});

search.initialize(projects);

createProjectsFolderFn();
await updateProjects();