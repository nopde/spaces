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
    quit: () => ipcRenderer.invoke("quit"),
    minimize: () => ipcRenderer.invoke("minimize"),
    onResetScroll: (callback) => ipcRenderer.on("reset-scroll", callback)
});