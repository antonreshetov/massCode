import axios from 'axios'
import { config } from 'dotenv'
import { mainWindow } from '../main'

config()

const pkg = require('../../../package.json')
const isDev = process.env.NODE_ENV === 'development'

const gitHubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`
  }
})

async function checkForUpdatesAndNotify () {
  if (isDev) return

  const currentVersion = pkg.version

  setInterval(async () => {
    const res = await gitHubApi.get('/repos/antonreshetov/massCode/tags')

    if (res.data && res.data[0]) {
      const tagNumber = res.data[0].name.substring(1)

      if (tagNumber !== currentVersion) {
        mainWindow.webContents.send('update-available')
      }
    }
  }, 1000 * 60 * 15)
}

export { checkForUpdatesAndNotify }
