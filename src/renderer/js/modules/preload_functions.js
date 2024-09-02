import { updateProjects } from "./projects.js";

export const createProjectsFolderFn = async () => {
    await window.electronAPI.createProjectsFolder();
}

export const deleteProjectFn = async (name) => {
    await window.electronAPI.deleteProject(name);
    updateProjects();
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
    await window.electronAPI.renameProject(old_name, new_name);
}

async function getProjectsFn() {
    return await window.electronAPI.getProjects();
}

export async function getProjects() {
    try {
        const folders = await getProjectsFn();
        return folders;
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
    }
}

export const openTerminalFn = async (name = "") => {
    await window.electronAPI.openTerminal(name);
}