import { Modal } from "./ascended-framework/modal.js";
import { codeProjectFn, openProjectFolderFn, getProjectsFn, openTerminalFn, renameProjectFn, deleteProjectFn } from "./preload_functions.js";

export const updateProjects = async () => {
    const projects = await getProjectsFn();
    const currentConfig = await window.electronAPI.getConfig();

    projects.sort((a, b) => {
        if (currentConfig.favouriteProjects.includes(a) && !currentConfig.favouriteProjects.includes(b)) {
            return -1;
        }
        else if (!currentConfig.favouriteProjects.includes(a) && currentConfig.favouriteProjects.includes(b)) {
            return 1;
        }
        else {
            return a.localeCompare(b);
        }
    });

    const projectsContainer = document.querySelector(".projects");
    projectsContainer.innerHTML = "";

    projects.forEach(projectName => {
        const favourite = currentConfig.favouriteProjects.includes(projectName) ? "favourite" : "";
        const spaceHTML = `
            <div class="project" id="${projectName}">
                <div class="project-title">
                    <p>${projectName}</p>
                    <div class="favourite-star ${favourite}" id="${projectName} favourite-star"><span class="icons">&#xE735;</span></div>
                    <ascended-button primary primary-color="208, 188, 255" id="${projectName} open">
                        <span class="icons">&#xE8AD;</span>
                        Open
                    </ascended-button>
                </div>
                <div class="project-buttons">
                    <ascended-button id="${projectName} rename">
                        <span class="icons">&#xE8AC;</span>
                        Rename
                    </ascended-button>
                    <ascended-button id="${projectName} delete">
                        <span class="icons">&#xECC9;</span>
                        Delete
                    </ascended-button>
                    <ascended-button id="${projectName} openFolder">
                        <span class="icons">&#xE838;</span>
                        Open folder
                    </ascended-button>
                    <ascended-button id="${projectName} openTerminal">
                        <span class="icons">&#xE756;</span>
                        Open terminal
                    </ascended-button>
                </div>
            </div>
        `;
        const projectContainer = document.createElement("div");

        projectContainer.innerHTML = spaceHTML;

        const project = projectContainer.querySelector(":scope > .project");

        projectsContainer.appendChild(project);

        const openBtn = document.getElementById(`${projectName} open`);
        const favouriteBtn = document.getElementById(`${projectName} favourite-star`);
        const renameBtn = document.getElementById(`${projectName} rename`);
        const deleteBtn = document.getElementById(`${projectName} delete`);
        const openFolderBtn = document.getElementById(`${projectName} openFolder`);
        const openTerminalBtn = document.getElementById(`${projectName} openTerminal`);

        renameBtn.addEventListener("click", (event) => {
            const modal = new Modal(
                "Rename project",
                `
                    <ascended-text-input id="rename-project-input" type="text" placeholder="New name" required></ascended-text-input>
                `,
                [
                    "<ascended-button cancel>Cancel</ascended-button>",
                    "<ascended-button action primary primary-color='208, 188, 255'>Rename</ascended-button>",
                ],
                null,
                true,
            );
            const modalInput = modal.modalContent.shadowRoot.querySelector("#rename-project-input");

            modal.addEventListener(modal.EVENTS.ASK_EXIT.name, async () => {
                const newProjectName = modalInput.value;
                if (newProjectName.length === 0 || newProjectName === projectName) {
                    return;
                }

                await renameProjectFn(projectName, newProjectName.replace(/ /g, "-"));

                let config = await window.electronAPI.getConfig();

                config.favouriteProjects.forEach(async (project, index) => {
                    if (project === projectName) {
                        config.favouriteProjects[index] = newProjectName;
                        await window.electronAPI.updateConfig(config);
                        return;
                    }
                });

                await updateProjects();

                modal.authorizeExit();
            });

            modal.show();
            modalInput.setValue(projectName);
            modalInput.focus();
        });

        deleteBtn.addEventListener("click", (event) => {
            const modal = new Modal(
                "Delete project",
                `
                    <p style="font-size: 16px">This action <strong>cannot</strong> be undone.</p>
                `,
                [
                    "<ascended-button cancel>Cancel</ascended-button>",
                    "<ascended-button action primary primary-color='208, 188, 255'>Delete</ascended-button>",
                ],
                null,
                true,
            );

            modal.addEventListener(modal.EVENTS.ASK_EXIT.name, async () => {
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

                const error = await deleteProjectFn(projectName);

                waitingModal.authorizeExit();

                if (error) {
                    modal.authorizeExit();

                    const errorModal = new Modal(
                        "Error",
                        `
                            <p>An error occurred while deleting the project: ${error.message}</p>
                        `,
                        [
                            "<ascended-button primary primary-color='208, 188, 255' cancel>OK</ascended-button>",
                        ],
                        false,
                        true,
                    );

                    errorModal.show();
                    return;
                }

                let config = await window.electronAPI.getConfig();

                config.favouriteProjects.forEach(async (project, index) => {
                    if (project === projectName) {
                        config.favouriteProjects.splice(index, 1);
                        config.favouriteProjects = config.favouriteProjects.sort();
                        await window.electronAPI.updateConfig(config);
                        return;
                    }
                });

                await updateProjects();

                modal.authorizeExit();
            });

            modal.show();
        });

        openFolderBtn.addEventListener("click", (event) => {
            openProjectFolderFn(projectName);
        });

        openTerminalBtn.addEventListener("click", (event) => {
            openTerminalFn(projectName);
        });

        openBtn.addEventListener("click", (event) => {
            codeProjectFn(projectName);
        });

        favouriteBtn.addEventListener("click", async (event) => {
            const favourite = !favouriteBtn.classList.contains("favourite");

            favouriteBtn.classList.toggle("favourite", favourite);

            const config = await window.electronAPI.getConfig();

            config.favouriteProjects = config.favouriteProjects.filter(project => project !== projectName);

            if (favourite) {
                config.favouriteProjects.push(projectName);
            }

            config.favouriteProjects = config.favouriteProjects.sort();

            await window.electronAPI.updateConfig(config);
            await updateProjects();
        });
    });

    const searchBar = document.getElementById("search");
    searchBar._inputEvent();
}