import { Modal } from "./ascended-framework/modal.js";
import { RippleHandler } from "./ascended-framework/utils.js";
import { Menu, MenuItem } from "./ascended-framework/menu.js";
import { codeProjectFn, openProjectFolderFn, getProjectsFn, openTerminalFn, renameProjectFn, deleteProjectFn } from "./preload_functions.js";

const searchBar = document.getElementById("search");

const renameProject = async (projectName) => {
    const modal = new Modal(
        "Rename project",
        `
            <ascended-text-input id="rename-project-input" type="text" placeholder="New name" required></ascended-text-input>
        `,
        [
            "<ascended-button cancel>Cancel</ascended-button>",
            "<ascended-button action accent accent-color='208, 188, 255'>Rename</ascended-button>",
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
}

const deleteProject = async (projectName) => {
    const modal = new Modal(
        "Delete project",
        `
                    <p style="font-size: 16px">This action <strong>cannot</strong> be undone.</p>
                `,
        [
            "<ascended-button cancel>Cancel</ascended-button>",
            "<ascended-button action accent accent-color='208, 188, 255'>Delete</ascended-button>",
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
                    "<ascended-button accent accent-color='208, 188, 255' cancel>OK</ascended-button>",
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
}

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
    const oldProjects = Array.from(projectsContainer.querySelectorAll(".project"));
    const oldProjectsNames = oldProjects.map(project => project.id);
    projectsContainer.innerHTML = "";

    const ascendedMenus = document.querySelectorAll("ascended-menu");
    ascendedMenus.forEach(menu => {
        if (menu.hasAttribute("not-removable")) {
            return;
        }

        menu.remove();
    });

    projects.forEach(projectName => {
        const projectExists = oldProjectsNames.includes(projectName);

        if (projectExists) {
            projectsContainer.appendChild(oldProjects.find(project => project.id === projectName));
        }
        else {
            const favourite = currentConfig.favouriteProjects.includes(projectName) ? "favourite" : "";
            const spaceHTML = `
                <div class="project hidden" id="${projectName}">
                    <div class="favourite-star ${favourite}" id="${projectName} favourite-star"><span class="icons">&#xE735;</span></div>
                    <p>${projectName}</p>
                    <ascended-button accent accent-color="208, 188, 255" id="${projectName} open">
                        <style>
                            button {
                                margin-left: 45px;
                            }

                            button:has(.text.expanded) {
                                margin-left: 0;
                            }

                            .icons {
                                transition: margin-right 250ms cubic-bezier(.175, .885, .32, 1.275);
                            }

                            :host(:hover) .icons {
                                margin-right: 45px;
                            }

                            .text {
                                position: absolute;
                                right: 20px;
                                overflow: hidden;
                                white-space: nowrap;
                                opacity: 0;
                                transform: translateX(5px) translateY(15px) rotate(26deg);
                                pointer-events: none;
                                transition: all 250ms cubic-bezier(.175, .885, .32, 1.275);
                            }
                        </style>

                        <span class="icons">&#xE8AD;</span>
                        <p class="text">Open</p>
                    </ascended-button>
                    <ascended-button id="${projectName} moreSettings">
                        <span class="icons">&#xE712;</span>
                        <ascended-tooltip>More options</ascended-tooltip>
                    </ascended-button>
                </div>
            `;

            const projectContainer = document.createElement("div");

            projectContainer.innerHTML = spaceHTML;

            const project = projectContainer.querySelector(":scope > .project");

            projectsContainer.appendChild(project);

            const openBtn = document.getElementById(`${projectName} open`);
            const openBtnText = openBtn.buttonElement.querySelector(".text");

            const favouriteBtn = document.getElementById(`${projectName} favourite-star`);

            openBtn.addEventListener("mouseenter", () => {
                const animation = openBtnText.animate(
                    [
                        {
                            opacity: 1,
                            transform: "translateX(0px) translateY(0px) rotate(0deg)",
                        }
                    ],
                    {
                        duration: 250,
                        easing: "cubic-bezier(.175, .885, .32, 1.275)",
                        fill: "forwards",
                    }
                );

                animation.onfinish = () => {
                    openBtnText.classList.add("expanded");
                }
            });

            openBtn.addEventListener("mouseleave", () => {
                const animation = openBtnText.animate(
                    [
                        {
                            opacity: 0,
                            transform: "translateX(5px) translateY(15px) rotate(26deg)",
                        }
                    ],
                    {
                        duration: 250,
                        easing: "cubic-bezier(.175, .885, .32, 1.275)",
                        fill: "forwards",
                    }
                );

                animation.onfinish = () => {
                    openBtnText.classList.remove("expanded");
                }
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

            new RippleHandler(favouriteBtn, "255, 255, 255", .16, true);
        }

        const moreSettingsBtn = document.getElementById(`${projectName} moreSettings`);

        new Menu(moreSettingsBtn, [
            new MenuItem(
                `
                    <span class="icons">&#xE8AC;</span>
                    <p>Rename</p>
                `,
                () => {
                    renameProject(projectName);
                }
            ),
            new MenuItem("Separator"),
            new MenuItem(
                `
                    <span class="icons">&#xE74D;</span>
                    <p>Delete</p>
                `,
                () => {
                    deleteProject(projectName);
                }
            ),
            new MenuItem("Separator"),
            new MenuItem(
                `
                    <span class="icons">&#xE838;</span>
                    <p>Open folder</p>
                `,
                () => {
                    openProjectFolderFn(projectName);
                }
            ),
            new MenuItem("Separator"),
            new MenuItem(
                `
                    <span class="icons">&#xE756;</span>
                    <p>Open terminal</p>
                `,
                () => {
                    openTerminalFn(projectName);
                }
            ),
        ]);
    });

    searchBar._inputEvent();
}