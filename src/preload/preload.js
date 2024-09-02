const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld("electronAPI", {
    createProjectsFolder: () => ipcRenderer.invoke("createProjectsFolder"),
    getProjects: () => ipcRenderer.invoke("getProjects"),
    openProjectsFolder: () => ipcRenderer.invoke("openProjectsFolder"),
    openProjectFolder: (name) => ipcRenderer.invoke("openProjectFolder", name),
    createProject: (name) => ipcRenderer.invoke("createProject", name),
    deleteProject: (name) => ipcRenderer.invoke("deleteProject", name),
    codeProject: (name) => ipcRenderer.invoke("codeProject", name),
    renameProject: (old_name, new_name) => ipcRenderer.invoke("renameProject", old_name, new_name),
    openTerminal: (name) => ipcRenderer.invoke("openTerminal", name),
    quit: () => ipcRenderer.invoke("quit"),
    minimize: () => ipcRenderer.invoke("minimize"),
    onResetScroll: (callback) => ipcRenderer.on("reset-scroll", callback)
});