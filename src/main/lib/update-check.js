import axios from 'axios'
import { mainWindow } from '../main'

const pkg = require('../../../package.json')
const isDev = process.env.NODE_ENV === 'development'

function checkForUpdatesAndNotify () {
  if (isDev) return

  async function check () {
    const currentVersion = pkg.version
    const reBeta = /beta/

    if (reBeta.test(currentVersion)) return

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
  }

  check()
  // setInterval(check, 1000 * 60 * 15)
  setInterval(check, 1000 * 60 * 15)
}

export { checkForUpdatesAndNotify }
