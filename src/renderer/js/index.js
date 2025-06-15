import { SearchBar } from "./modules/searchbar.js";
import { createProjectsFolderFn, createProjectFn, openProjectsFolderFn, openTerminalFn } from "./modules/preload_functions.js";
import { updateProjects } from "./modules/projects.js";
import { Modal } from "./modules/ascended-framework/modal.js";
import { Menu, MenuItem } from "./modules/ascended-framework/menu.js";

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
                "Clone repository",
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
                    </style>
                    <div class="container">
                        <div class="switch-container">
                            <p>Use repository name</p>
                            <ascended-switch id="use-repository-name" checked accent accent-color="208, 188, 255"></ascended-switch>
                        </div>
                        <div class="separator"></div>
                        <ascended-text-input id="name" icon="<span class='icons'>&#xEBC6;</span>" placeholder="Project name" label="Project name"></ascended-text-input>
                        <ascended-text-input id="url" icon="<span class='icons'>&#xE71B;</span>" placeholder="Username / Repository" label="Repository URL"></ascended-text-input>
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

            modalNameInput.hide();

            useRepositoryNameSwitch.addEventListener("ascended-switch-toggle", () => {
                if (useRepositoryNameSwitch.checked) {
                    modalNameInput.hide();
                }
                else {
                    modalNameInput.show();
                }
            });

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

                modal.authorizeExit();

                const waitingModal = new Modal(
                    "Cloning repository",
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

                .input-container {
                    display: flex;
                    align-items: end;
                    gap: 5px;
                }

                .input-container ascended-text-input {
                    flex: 1 1;
                }

                .input-container ascended-button {
                    height: 37px;
                }
            </style>

            <div class="section">
                <div class="title">General</div>
                <div class="switch-container">
                    <p>Open projects on creation</p>
                    <ascended-switch id="open-projects-on-creation" ${config.openProjectsOnCreation ? "checked" : ""} accent accent-color="208, 188, 255"></ascended-switch>
                </div>
                <div class="separator"></div>
                <div class="input-container">
                    <ascended-text-input id="projects-folder-input" icon="<span class='icons'>&#xE8B7;</span>" label="Projects folder" placeholder="New folder path" required></ascended-text-input>
                    <ascended-button id="select-folder" accent accent-color="208, 188, 255">
                        <span class="icons">&#xE838;</span>
                    </ascended-button>
                    <ascended-button id="reset-to-default">
                        <span class="icons">&#xE72C;</span>
                    </ascended-button>
                </div>
            </div>
            <div class="section">
                <p class="title">Advanced</p>
                <ascended-text-input id="code-editor-command" icon="<span class='icons'>&#xE756;</span>" placeholder="Command (e.g. code)" label="Code editor command"></ascended-text-input>
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

    const openProjectsOnCreationSwitch = root.querySelector("#open-projects-on-creation");
    const codeEditorCommandInput = root.querySelector("#code-editor-command");
    const projectsFolderInput = modal.modalContent.shadowRoot.querySelector("#projects-folder-input");
    const selectFolderBtn = modal.modalContent.shadowRoot.querySelector("#select-folder");
    const resetToDefaultBtn = modal.modalContent.shadowRoot.querySelector("#reset-to-default");

    selectFolderBtn.addEventListener("ascended-button-click", async () => {
        const folderPath = await window.electronAPI.selectFolder(config.projectsFolder);
        if (folderPath) {
            projectsFolderInput.setValue(folderPath);
        }
    });

    resetToDefaultBtn.addEventListener("ascended-button-click", async () => {
        projectsFolderInput.setValue(config.defaultProjectsFolder);
    });

    projectsFolderInput.setValue(config.projectsFolder);
    codeEditorCommandInput.setValue(config.codeEditorCommand);

    modal.addEventListener(modal.EVENTS.ASK_EXIT.name, async () => {
        config.openProjectsOnCreation = openProjectsOnCreationSwitch.checked;
        if (codeEditorCommandInput.value) {
            config.codeEditorCommand = codeEditorCommandInput.value;
        }

        const newProjectsFolder = projectsFolderInput.value;
        if (newProjectsFolder.length != 0 || newProjectsFolder != config.projectsFolder) {
            config.projectsFolder = newProjectsFolder;
        }

        try {
            await window.electronAPI.updateConfig(config);
        }
        catch (error) {
            console.error(error.message);
            return;
        }

    
        await updateProjects();

        modal.authorizeExit();
    });

    modal.show();
});

// Initialization

currentConfig = await window.electronAPI.getConfig();
isGitInstalled = await window.electronAPI.isGitInstalled();

window.electronAPI.onResetScroll(() => {
    if (projects) {
        projects.scrollTop = 0;
    }
});

window.electronAPI.onConfigChange((newConfig) => {
    currentConfig = newConfig;
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