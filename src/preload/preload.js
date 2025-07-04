const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld("electronAPI", {
    createProjectsFolder: () => ipcRenderer.invoke("createProjectsFolder"),
    getProjects: () => {
        return ipcRenderer.invoke("getProjects");
    },
    openProjectsFolder: () => ipcRenderer.invoke("openProjectsFolder"),
    openProjectFolder: (name) => ipcRenderer.invoke("openProjectFolder", name),
    createProject: (name) => ipcRenderer.invoke("createProject", name),
    deleteProject: (name) => ipcRenderer.invoke("deleteProject", name),
    codeProject: (name) => ipcRenderer.invoke("codeProject", name),
    renameProject: (old_name, new_name) => {
        return ipcRenderer.invoke("renameProject", old_name, new_name);
    },
    openTerminal: (name) => ipcRenderer.invoke("openTerminal", name),
    getConfig: (configName) => {
        return ipcRenderer.invoke("getConfig", configName);
    },
    updateConfig: (config) => {
        return ipcRenderer.invoke("updateConfig", config);
    },
    onConfigChange: (callback) => {
        ipcRenderer.on("config-change", (_event, value) => callback(value));
    },
    selectFolder: (currentPath) => {
        return ipcRenderer.invoke("selectFolder", currentPath);
    },
    isGitInstalled: () => {
        return ipcRenderer.invoke("isGitInstalled");
    },
    cloneProject: (url, projectName) => {
        return ipcRenderer.invoke("cloneProject", url, projectName);
    },
    quit: () => ipcRenderer.invoke("quit"),
    maximize: () => {
        return ipcRenderer.invoke("maximize");
    },
    onMaximize: (callback) => {
        ipcRenderer.on("onMaximize", (_event, isMaximized) => callback(isMaximized));
    },
    minimize: () => ipcRenderer.invoke("minimize"),
    onResetScroll: (callback) => ipcRenderer.on("reset-scroll", callback),
    onRefreshProjects: (callback) => ipcRenderer.on("refresh-projects", callback),
});