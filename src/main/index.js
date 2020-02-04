import { app, Menu, ipcMain, dialog, BrowserWindow } from 'electron'
import { createMainWindow, mainWindow } from './main'
import { createTray, destroyTray } from './tray'
import store from './store'
import mainMenu from './lib/main-menu'
import touchBar from './lib/touch-bar'
import { initAnalytics } from './lib/analytics'
import { checkForUpdatesAndNotify } from './lib/update-check'

const isDev = process.env.NODE_ENV === 'development'
let menu

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (!isDev) {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

function init () {
  createMainWindow()

  menu = Menu.buildFromTemplate(mainMenu(mainWindow))
  Menu.setApplicationMenu(menu)
}

function initTray () {
  if (process.platform !== 'darwin') return

  const isAssistant = store.preferences.get('assistant')
  if (isAssistant) createTray()
}

app.on('ready', () => {
  init()
  initTray()
  initAnalytics()
  checkForUpdatesAndNotify()
  mainWindow.setTouchBar(touchBar)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  mainWindow.removeAllListeners()
})

app.on('activate', () => {
  if (mainWindow === null) {
    init()
  } else {
    mainWindow.show()
  }
})

ipcMain.on('preferences:assistant', (e, enable) => {
  enable ? initTray() : destroyTray()
})

ipcMain.on('message', (e, options) => {
  dialog.showMessageBox(BrowserWindow.getFocusedWindow(), options)
})

// Переключение чекбокса у Editor/Preview Markdown
ipcMain.on('menu:markdown-preview', (e, value) => {
  menu.items[3].submenu.items[2].checked = value
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
