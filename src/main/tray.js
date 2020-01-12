import { BrowserWindow, Tray, ipcMain, globalShortcut } from 'electron'
import store from './store'

import path from 'path'

let tray
let trayWindow

const winURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080/#tray'
    : `file://${__dirname}/index.html#tray`

function createTray () {
  tray = new Tray(path.join(__static, '/tray.png'))

  tray.on('click', () => {
    showTray()
  })
  createTrayWindow()

  const shortcut = store.get('preferences.assistant.shortcut')

  globalShortcut.register(shortcut, () => {
    showTray()
  })

  ipcMain.on('preferences:assistant:shortcut', (e, shortcuts) => {
    globalShortcut.unregister(shortcuts.old)
    globalShortcut.register(shortcuts.new, () => {
      showTray()
    })
  })
}

function createTrayWindow () {
  trayWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    movable: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: false
    }
  })

  trayWindow.loadURL(winURL)

  trayWindow.on('blur', () => {
    trayWindow.hide()
    trayWindow.webContents.send('tray:hide')
  })

  trayWindow.on('show', () => {
    trayWindow.focus()
    trayWindow.webContents.send('tray:show')
  })

  ipcMain.on('tray:hide', () => {
    trayWindow.hide()
  })
}

function showTray () {
  const trayWindowBounds = trayWindow.getBounds()

  let { x, y, width, height } = tray.getBounds()
  x = x - (trayWindowBounds.width / 2 - width / 2)
  y = y + height + 3

  trayWindow.setBounds({ x, y })
  trayWindow.show()
}

function destroyTray () {
  const shortcut = store.get('preferences.assistant.shortcut')

  trayWindow.destroy()
  tray.destroy()
  globalShortcut.unregister(shortcut)
}

export { createTray, createTrayWindow, showTray, destroyTray }
