import { BrowserWindow } from 'electron'
import store from './store'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow
const winURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080'
    : `file://${__dirname}/index.html`

const bounds = {
  x: undefined,
  y: undefined,
  height: 563,
  width: 1000,
  ...store.get('bounds')
}

function createMainWindow () {
  mainWindow = new BrowserWindow({
    ...bounds,
    title: 'massCode',
    useContentSize: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL)

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.on('closed', e => {
    mainWindow = null
  })
}

export { createMainWindow, mainWindow }
