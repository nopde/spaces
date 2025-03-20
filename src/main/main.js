const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require("electron/main");
const { shell, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("original-fs");
const fs_promises = require("original-fs").promises;
const path = require("node:path");
const chokidar = require("chokidar");

let mainWindow;
let tray;
const gotTheLock = app.requestSingleInstanceLock();

let isGitInstalled = true;
let projectsFolderWatcher = null;

const iconPath = path.join(app.getAppPath(), "assets/icon.ico");
const img = nativeImage.createFromPath(iconPath);

const configPath = path.join(app.getPath("userData"), "config.json");

const defaultConfig = {
    reducedMotion: false,
    ripples: true,
    openProjectsOnCreation: false,
    codeEditorCommand: "code",
    defaultProjectsFolder: path.join(app.getPath("userData"), "Projects"),
    projectsFolder: path.join(app.getPath("userData"), "Projects"),
    favouriteProjects: [],
};

let config = defaultConfig;

function getConfig() {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function setConfig(newConfig) {
    let oldConfig = config;
    config = newConfig;
    mainWindow.webContents.send("config-change", config);

    if (oldConfig.projectsFolder !== config.projectsFolder) {
        watchProjectsFolder();
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    return config;
}

function watchProjectsFolder() {
    if (projectsFolderWatcher) {
        projectsFolderWatcher.close();
    }

    projectsFolderWatcher = chokidar.watch(config.projectsFolder, {
        depth: 0,
    });

    projectsFolderWatcher.on("addDir", () => {
        mainWindow.webContents.send("refresh-projects");
    });

    projectsFolderWatcher.on("unlinkDir", () => {
        mainWindow.webContents.send("refresh-projects");
    });
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 700,
        frame: false,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        icon: img,
        webPreferences: {
            // devTools: false,
            zoomFactor: 1.0,
            preload: path.join(app.getAppPath(), "src/preload/preload.js")
        }
    });

    mainWindow.loadFile(path.join(app.getAppPath(), "src/renderer/index.html"));
}

const exec = require("child_process").exec;

function execute(command, callback = null, errorCallback = null) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            if (errorCallback) {
                errorCallback(error);
            }
            else {
                console.error(error);
            }
        }
        if (callback) {
            callback(stdout);
        }
    });
}

if (!gotTheLock) {
    app.quit();
}
else {
    app.whenReady().then(() => {
        createWindow();

        if (fs.existsSync(configPath)) {
            config = getConfig();
        }
        else {
            setConfig(config);
        }

        execute("git --version", null, () => {
            isGitInstalled = false;
        });

        watchProjectsFolder();

        mainWindow.on("show", () => {
            mainWindow.webContents.zoomFactor = 1.0;
            mainWindow.webContents.send("reset-scroll");
        });

        app.on("second-instance", (event, commandLine, workingDirectory) => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
                mainWindow.webContents.send("reset-scroll");
            }
        });

        autoUpdater.on("update-available", (event) => {
            const dialogOpts = {
                type: "info",
                buttons: ["Download now", "Remind me later"],
                title: "Spaces Updater",
                detail: "A new version is available."
            }

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) {
                    autoUpdater.downloadUpdate();
                }
            });
        });

        autoUpdater.on("update-downloaded", (event) => {
            const dialogOpts = {
                type: "info",
                buttons: ["Install now", "Install later"],
                title: "Spaces Updater",
                detail: "A new version has been downloaded. Restart the application to apply the updates."
            }

            dialog.showMessageBox(dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) {
                    autoUpdater.quitAndInstall(isSilent = false, isForceRunAfter = true);
                    mainWindow.destroy();
                }
            });
        });

        autoUpdater.autoDownload = false;
        autoUpdater.checkForUpdates();

        mainWindow.on("close", function (event) {
            event.preventDefault();
            mainWindow.hide();
        });

        tray = new Tray(img);

        const contextMenu = Menu.buildFromTemplate([
            { label: `Spaces (v${app.getVersion()})`, enabled: false, icon: img.resize({ width: 16, height: 16 }) },
            { type: "separator" },
            { label: "Show", click: function () { mainWindow.show(); } },
            {
                label: "Check for updates",
                click: async function () {
                    const result = await autoUpdater.checkForUpdates();
                    const latestVersion = result["updateInfo"]["version"];

                    if (app.getVersion() === latestVersion) {
                        dialog.showMessageBox({
                            type: "info",
                            buttons: ["OK"],
                            title: "Spaces Updater",
                            detail: "You are using the latest version of Spaces."
                        });
                    }

                }
            },
            { type: "separator" },
            { label: "Quit Spaces", click: function () { mainWindow.destroy(); app.quit(); } }
        ]);

        tray.setToolTip(`Spaces (v${app.getVersion()})`);

        tray.setContextMenu(contextMenu);

        tray.on("click", () => {
            mainWindow.show();
        });

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });

        ipcMain.handle("createProjectsFolder", async (event) => {
            try {
                const parentFolderPath = config.projectsFolder;

                if (!fs.existsSync(parentFolderPath)) {
                    await fs.promises.mkdir(parentFolderPath, { recursive: true });
                }

                return true;
            } catch (error) {
                console.error(error.message);
                throw error;
            }
        });

        ipcMain.handle("getProjects", async (event) => {
            const folderPath = config.projectsFolder;

            try {
                const files = await fs.promises.readdir(folderPath);
                const folders = files.filter((name) => fs.statSync(path.join(folderPath, name)).isDirectory());
                return folders;
            } catch (error) {
                console.error(`Error fetching projects: ${error.message}`);
                throw error;
            };
        });

        ipcMain.handle("openProjectsFolder", async (event) => {
            const folderPath = config.projectsFolder;
            shell.openPath(folderPath);
        });

        ipcMain.handle("openProjectFolder", async (event, name) => {
            const folderPath = path.join(config.projectsFolder, name);
            shell.openPath(folderPath);
        });

        ipcMain.handle("createProject", async (event, name) => {
            try {
                const folderPath = path.join(config.projectsFolder, name.replace(/ /g, "-"));
                await fs_promises.mkdir(folderPath);
                if (config.openProjectsOnCreation) {
                    execute(`${config.codeEditorCommand} ${folderPath}`, (output) => {
                        return output;
                    });
                }
                return true;
            } catch (error) {
                console.error(error.message);
                throw error;
            }
        });

        ipcMain.handle("deleteProject", async (event, name) => {
            try {
                const folderPath = path.join(config.projectsFolder, name);

                await deleteRecursiveFolder(folderPath);

                return true;
            } catch (error) {
                console.error(error.message);
                throw error;
            }
        });

        const deleteRecursiveFolder = async (folderPath) => {
            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const stats = await fs.promises.stat(filePath);

                if (stats.isDirectory()) {
                    await deleteRecursiveFolder(filePath);
                } else {
                    await fs.promises.unlink(filePath);
                }
            }

            await fs.promises.rmdir(folderPath);
        }

        ipcMain.handle("codeProject", async (event, name) => {
            const folderPath = path.join(config.projectsFolder, name.replace(/ /g, "-"));
            execute(`${config.codeEditorCommand} ${folderPath}`, (output) => {
                return output;
            });
        });

        ipcMain.handle("renameProject", async (event, old_name, new_name) => {
            const oldFolderPath = path.join(config.projectsFolder, old_name);
            const newFolderPath = path.join(config.projectsFolder, new_name);

            try {
                await fs.promises.rename(oldFolderPath, newFolderPath);
                return true;
            } catch (err) {
                console.error(`Error renaming project: '${old_name}' to '${new_name}'.`, err);
                throw err;
            }
        });

        ipcMain.handle("openTerminal", async (event, name) => {
            const folderPath = path.join(config.projectsFolder, name);
            execute(`start "" /D "${folderPath}"`, (output) => {
                return output;
            });
        });

        ipcMain.handle("getConfig", (event, name) => {
            return getConfig();
        });

        ipcMain.handle("updateConfig", (event, config) => {
            return setConfig(config);
        });

        ipcMain.handle("selectFolder", async (event, currentPath) => {
            const folderPath = await dialog.showOpenDialog(mainWindow, {
                properties: ["openDirectory"],
                defaultPath: currentPath,
            });

            if (folderPath.canceled) {
                return null;
            }

            return folderPath.filePaths[0];
        });

        ipcMain.handle("isGitInstalled", (event) => {
            return isGitInstalled;
        });

        ipcMain.handle("cloneProject", async (event, url, projectName) => {
            try {
                const folderPath = path.join(config.projectsFolder, projectName);
                let errorMsg = false;
                execute(`git clone ${url} ${folderPath}`, null, () => { errorMsg = true; });
                return errorMsg;
            } catch (error) {
                console.error(error.message);
            }
        });

        ipcMain.handle("quit", (event) => {
            app.quit();
        });

        ipcMain.handle("minimize", (event) => {
            mainWindow.minimize();
        });
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});