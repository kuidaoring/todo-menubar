import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getTask: async (id: number) => {
    return await ipcRenderer.invoke('getTask', id)
  },
  getTasks: async (filter: string) => {
    return await ipcRenderer.invoke('getTasks', filter)
  },
  addTask: async (title: string, isToday: boolean) => {
    return await ipcRenderer.invoke('addTask', title, isToday)
  },
  deleteTask: async (id: number) => {
    return await ipcRenderer.invoke('deleteTask', id)
  },
  toggleCompleted: async (id: number) => {
    return await ipcRenderer.invoke('toggleCompleted', id)
  },
  toggleIsToday: async (id: number) => {
    return await ipcRenderer.invoke('toggleIsToday', id)
  },
  updateDueDate: async (id: number, dueDate: Date | null) => {
    return await ipcRenderer.invoke('updateDueDate', id, dueDate)
  },
  updateMemo: async (id: number, memo: string | null) => {
    return await ipcRenderer.invoke('updateMemo', id, memo)
  },
  updateTitle: async (id: number, title: string) => {
    return await ipcRenderer.invoke('updateTitle', id, title)
  },
  toggleStepCompleted: async (id: number, stepId: number) => {
    return await ipcRenderer.invoke('toggleStepCompleted', id, stepId)
  },
  addStep: async (id: number, title: string) => {
    return await ipcRenderer.invoke('addStep', id, title)
  },
  deleteStep: async (id: number, stepId: number) => {
    return await ipcRenderer.invoke('deleteStep', id, stepId)
  },
  updateStepTitle: async (id: number, stepId: number, title: string) => {
    return await ipcRenderer.invoke('updateStepTitle', id, stepId, title)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
