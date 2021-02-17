import { BrowserWindow } from 'electron'
import store from './store'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow
const winURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080'
    : `file://${__dirname}/index.html`

function createMainWindow () {
  const bounds = {
    height: 563,
    width: 1000,
    ...store.app.get('bounds')
  }

  const backgroundColor =
    store.preferences.get('theme') === 'dark' ? '#333' : '#fff'

  mainWindow = new BrowserWindow({
    title: 'massCode',
    useContentSize: true,
    titleBarStyle: 'hidden',
    // Убираем хайлайт вокруг приложения на Mac
    transparent: process.platform === 'darwin',
    backgroundColor,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  mainWindow.setBounds(bounds)
  mainWindow.loadURL(winURL)

  if (isDev) {
    // @see https://github.com/SimulatedGREG/electron-vue/issues/389
    mainWindow.webContents.on('did-frame-finish-load', () => {
      mainWindow.webContents.once('devtools-opened', () => {
        mainWindow.focus()
      })
      mainWindow.webContents.openDevTools({ mode: 'bottom' })
    })
  }

  if (process.platform === 'darwin') {
    mainWindow.on('close', e => {
      e.preventDefault()

      if (mainWindow.isFullScreen()) {
        mainWindow.once('leave-full-screen', () => {
          mainWindow.hide()
        })
        mainWindow.setFullScreen(false)
      } else {
        mainWindow.hide()
      }
      store.app.set('bounds', mainWindow.getBounds())
    })
  }

  mainWindow.on('closed', e => {
    mainWindow = null
  })
}

export { createMainWindow, mainWindow }
