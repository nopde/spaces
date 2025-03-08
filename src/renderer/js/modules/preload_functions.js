export const createProjectsFolderFn = async () => {
    await window.electronAPI.createProjectsFolder();
}

export const deleteProjectFn = async (name) => {
    await window.electronAPI.deleteProject(name);
}

export const createProjectFn = async (name) => {
    await window.electronAPI.createProject(name);
}

export const openProjectFolderFn = async (name) => {
    await window.electronAPI.openProjectFolder(name);
}

export const openProjectsFolderFn = async () => {
    await window.electronAPI.openProjectsFolder();
}

export const codeProjectFn = async (name) => {
    await window.electronAPI.codeProject(name);
}

export const renameProjectFn = async (old_name, new_name) => {
    return await window.electronAPI.renameProject(old_name, new_name);
}

export const getProjectsFn = async () => {
    return await window.electronAPI.getProjects();
}

export const openTerminalFn = async (name = "") => {
    await window.electronAPI.openTerminal(name);
}