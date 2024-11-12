import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  getTasks,
  addTask,
  toggleCompleted,
  toggleIsToday,
  getTask,
  updateDueDate,
  updateMemo,
  updateTitle,
  toggleStepCompleted,
  addStep,
  deleteTask,
  updateStepTitle,
  deleteStep,
  Repeat,
  updateRepeat
} from './task'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 700,
    minHeight: 300,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    titleBarStyle: 'hiddenInset'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], '/tasks'))
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html', '/tasks'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('getTask', async (_, id: string) => {
    return getTask(id)
  })
  ipcMain.handle('getTasks', async (_, filter: string) => {
    return getTasks(filter)
  })
  ipcMain.handle('addTask', async (_, title: string, isToday: boolean) => {
    return addTask(title, isToday)
  })
  ipcMain.handle('deleteTask', async (_, id: string) => {
    deleteTask(id)
  })
  ipcMain.handle('toggleCompleted', async (_, id: string) => {
    return toggleCompleted(id)
  })
  ipcMain.handle('toggleIsToday', async (_, id: string) => {
    return toggleIsToday(id)
  })
  ipcMain.handle('updateDueDate', async (_, id: string, dueDate: Date | null) => {
    return updateDueDate(id, dueDate)
  })
  ipcMain.handle('updateRepeat', async (_, id: string, repeat: Repeat | null) => {
    return updateRepeat(id, repeat)
  })
  ipcMain.handle('updateMemo', async (_, id: string, memo: string | null) => {
    return updateMemo(id, memo)
  })
  ipcMain.handle('updateTitle', async (_, id: string, title: string) => {
    return updateTitle(id, title)
  })
  ipcMain.handle('toggleStepCompleted', async (_, id: string, stepId: string) => {
    return toggleStepCompleted(id, stepId)
  })
  ipcMain.handle('addStep', async (_, id: string, title: string) => {
    return addStep(id, title)
  })
  ipcMain.handle('deleteStep', async (_, id: string, stepId: string) => {
    return deleteStep(id, stepId)
  })
  ipcMain.handle('updateStepTitle', async (_, id: string, stepId: string, title: string) => {
    return updateStepTitle(id, stepId, title)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
