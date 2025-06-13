import { SearchBar } from "./modules/searchbar.js";
import { createProjectsFolderFn, createProjectFn, openProjectsFolderFn, openTerminalFn } from "./modules/preload_functions.js";
import { updateProjects } from "./modules/projects.js";
import { Modal } from "./modules/ascended-framework/modal.js";
import { Menu, MenuItem } from "./modules/menu.js";

// Variables

let currentConfig = null;
let isGitInstalled = null;

const quitBtn = document.getElementById("quit");
const maximizeBtn = document.getElementById("maximize");
const maximizeBtnSpan = maximizeBtn.querySelector("span.icons");
const minimizeBtn = document.getElementById("minimize");
const moreOptionsBtn = document.getElementById("more-options");
const gitOptionsBtn = document.getElementById("git-options");
const configurationBtn = document.getElementById("configuration");
const searchBarContainer = document.getElementById("search");
const searchBar = searchBarContainer.textInputElement;
const search = new SearchBar(searchBar);
const createProjectBtn = document.getElementById("create-project");
const projects = document.querySelector(".projects");

// Event listeners

quitBtn.addEventListener("click", async (event) => {
    await window.electronAPI.quit();
});

maximizeBtn.addEventListener("click", async () => {
    await window.electronAPI.maximize();
});

window.electronAPI.onMaximize((isMaximized) => {
    if (isMaximized) {
        maximizeBtnSpan.innerHTML = "&#xE923;";
    }
    else {
        maximizeBtnSpan.innerHTML = "&#xE922;";
    }
});

minimizeBtn.addEventListener("click", async (event) => {
    await window.electronAPI.minimize();
});

new Menu(moreOptionsBtn, [
    new MenuItem(
        `
            <span class="icons">&#xE838;</span>
            <p>Open projects folder</p>
        `,
        () => {
            openProjectsFolderFn();
        }
    ),
    new MenuItem("Separator"),
    new MenuItem(
        `
            <span class="icons">&#xE756;</span>
            <p>Open terminal</p>
        `,
        () => {
            openTerminalFn();
        }
    ),
], null, true);

new Menu(gitOptionsBtn, [
    new MenuItem(
        `
            <span class="icons">&#xE8C8;</span>
            <p>Clone</p>
        `,
        () => {
            if (!isGitInstalled) {
                const modal = new Modal(
                    "Git not installed",
                    `
                        <p>Git is not installed on your system.</p>
                    `,
                    null,
                    false,
                    true,
                );

                modal.show();
                return;
            }

            const modal = new Modal(
                "Clone project",
                `
                    <style>
                        .container {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
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
                            color: rgba(255, 255, 255, .75);
                        }

                        .switch-container p {
                            font-size: 16px;
                            word-break: break-word;
                        }

                        .container:has(#use-repository-name[checked]) #name {
                            display: none;
                        }

                        .container:has(#use-repository-name[checked]) #name-separator {
                            display: none;
                        }
                    </style>
                    <div class="container">
                        <div class="switch-container">
                            <p>Use repository name</p>
                            <ascended-switch id="use-repository-name" checked accent accent-color="208, 188, 255"></ascended-switch>
                        </div>
                        <div class="separator" id="name-separator"></div>
                        <ascended-text-input id="name" placeholder="Project name" label="Project name"></ascended-text-input>
                        <div class="separator"></div>
                        <ascended-text-input id="url" placeholder="username/repository" label="Repository URL"></ascended-text-input>
                    </div>
                `,
                [
                    "<ascended-button cancel>Cancel</ascended-button>",
                    "<ascended-button action accent accent-color='208, 188, 255'>Clone</ascended-button>",
                ],
                null,
                true,
            );
            const modalInput = modal.modalContent.shadowRoot.querySelector("#url");
            const modalNameInput = modal.modalContent.shadowRoot.querySelector("#name");
            const useRepositoryNameSwitch = modal.modalContent.shadowRoot.querySelector("#use-repository-name");

            modal.addEventListener(modal.EVENTS.ASK_EXIT.name, async () => {
                let URL = modalInput.value;
                const parseURL = (input) => {
                    if (!input || typeof input !== "string") return null;

                    input = input.trim();

                    input = input.replace(/^https?:\/\//, "").replace(/^www\./, "");

                    if (input.startsWith("git@github.com:")) {
                        input = input.slice("git@github.com:".length);
                    }
                    if (input.startsWith("github.com/")) {
                        input = input.slice("github.com/".length);
                    }

                    const parts = input.split("/").filter(Boolean);
                    if (parts.length < 2) return null;

                    const user = parts[0];
                    const repo = parts[1].replace(/\.git$/, "");

                    return `https://github.com/${user}/${repo}`;
                }
                let fixedURL = parseURL(URL);

                const projectName = useRepositoryNameSwitch.checked ? fixedURL.split("/").pop() : modalNameInput.value;

                if (projectName.length === 0) {
                    modal.denyExit();
                    return;
                }

                const waitingModal = new Modal(
                    "Deleting project",
                    `
                        <style>
                            .container {
                                overflow: hidden;
                            }

                            .spinner {
                                margin: auto;
                                width: 50px;
                                height: 50px;
                                border-radius: 50%;
                                border: 1px solid rgb(75, 75, 75);
                                border-top-color: rgb(205, 205, 205);
                                animation: spin 1s linear infinite;
                            }

                            @keyframes spin {
                                0% {
                                    transform: rotate(0deg);
                                }
                                100% {
                                    transform: rotate(360deg);
                                }
                            }
                        </style>

                        <div class="container">
                            <div class="spinner"></div>
                        </div>
                    `,
                    [],
                    null,
                    true,
                );

                waitingModal.show();

                await window.electronAPI.cloneProject(fixedURL, projectName);

                waitingModal.authorizeExit();

                modal.authorizeExit();
                await updateProjects();
            });

            modal.show();
            modalInput.focus();
        }
    )
], null, true);

configurationBtn.addEventListener("click", async () => {
    const config = await window.electronAPI.getConfig();

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
                    color: rgba(255, 255, 255, .75);
                }

                .switch-container p {
                    font-size: 16px;
                    word-break: break-word;
                }

                #change-projects-folder {
                    width: 100%;
                }
            </style>

            <div class="section">
                <div class="title">General</div>
                <div class="switch-container">
                    <p>Ripples</p>
                    <ascended-switch id="ripples" ${config.ripples ? "checked" : ""} accent accent-color="208, 188, 255"></ascended-switch>
                </div>
                <div class="separator"></div>
                <div class="switch-container">
                    <p>Open projects on creation</p>
                    <ascended-switch id="open-projects-on-creation" ${config.openProjectsOnCreation ? "checked" : ""} accent accent-color="208, 188, 255"></ascended-switch>
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
            "<ascended-button action accent accent-color='208, 188, 255'>Save</ascended-button>",
        ],
        null,
        true,
    );

    const root = modal.modalContent.shadowRoot;

    const ripplesSwitch = root.querySelector("#ripples");
    const openProjectsOnCreationSwitch = root.querySelector("#open-projects-on-creation");
    const codeEditorCommandInput = root.querySelector("#code-editor-command");
    const changeProjectsFolderBtn = root.querySelector("#change-projects-folder");

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
                <ascended-button id="select-folder" accent accent-color="208, 188, 255">Select folder from explorer</ascended-button>
                <ascended-button id="reset-to-default">Reset to default</ascended-button>
            `,
            [
                "<ascended-button cancel>Cancel</ascended-button>",
                "<ascended-button action accent accent-color='208, 188, 255'>Change</ascended-button>",
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
    document.body.toggleAttribute("ripples", currentConfig.ripples);
}

// Initialization

currentConfig = await window.electronAPI.getConfig();
applyConfig();

isGitInstalled = await window.electronAPI.isGitInstalled();

window.electronAPI.onResetScroll(() => {
    if (projects) {
        projects.scrollTop = 0;
    }
});

window.electronAPI.onConfigChange((newConfig) => {
    currentConfig = newConfig;
    applyConfig();
});

window.electronAPI.onRefreshProjects(async () => {
    await updateProjects();
});

searchBar.focus();

const createProject = async () => {
    const projectName = search.normalizeName(searchBar.value);
    const error = await createProjectFn(projectName);

    if (error) {
        const errorModal = new Modal(
            "Error",
            `
                <p>An error occurred while creating the project: ${error.message}</p>
            `,
            [
                "<ascended-button accent accent-color='208, 188, 255' cancel>OK</ascended-button>",
            ],
            false,
            true,
        );

        errorModal.show();
        return;
    }

    await updateProjects();

    searchBar.focus();
}

searchBar.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        if (searchBar.value) {
            createProject();
        }
    }
});

createProjectBtn.addEventListener("ascended-button-click", async () => {
    if (searchBar.value) {
        createProject();
    }
});

search.initialize(projects);

createProjectsFolderFn();
await updateProjects();