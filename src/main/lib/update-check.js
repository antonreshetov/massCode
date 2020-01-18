import axios from 'axios'
import { mainWindow } from '../main'

const pkg = require('../../../package.json')
const isDev = process.env.NODE_ENV === 'development'

async function checkForUpdatesAndNotify () {
  if (isDev) return

  const currentVersion = pkg.version

  setInterval(async () => {
    const res = await axios.get(
      'https://github.com/antonreshetov/masscode/releases/latest'
    )

    if (res) {
      const latest = res.request.socket._httpMessage.path
        .split('/')
        .pop()
        .substring(1)
      if (latest !== currentVersion) {
        mainWindow.webContents.send('update-available')
      }
    }
  }, 1000 * 60 * 15)
}

export { checkForUpdatesAndNotify }
