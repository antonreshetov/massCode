import { app, Menu, ipcMain } from 'electron'
import { createMainWindow, mainWindow } from './main'
import { createTray, destroyTray } from './tray'
import store from './store'
import mainMenu from './lib/main-menu'
import { initAnalytics } from './lib/analytics'
const isDev = process.env.NODE_ENV === 'development'

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

  const menu = Menu.buildFromTemplate(mainMenu(mainWindow))
  Menu.setApplicationMenu(menu)
}

function initTray () {
  if (process.platform !== 'darwin') return

  const isAssistant = store.get('preferences.assistant.enable')
  if (isAssistant) createTray()
}

app.on('ready', () => {
  init()
  initTray()
  initAnalytics()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  store.set('bounds', mainWindow.getBounds())
})

app.on('activate', () => {
  if (mainWindow === null) {
    init()
  }
})

ipcMain.on('preferences:assistant', (e, enable) => {
  enable ? initTray() : destroyTray()
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
