import Store from 'electron-store'
import { homedir, platform } from 'os'

const isWin = platform() === 'win32'

const defaultPath = isWin ? homedir() + '\\massCode' : homedir() + '/massCode'

const preferences = new Store({
  name: 'preferences',
  cwd: 'massCode',

  schema: {
    storagePath: {
      default: defaultPath
    },
    theme: {
      default: 'dark'
    },
    assistant: {
      default: true
    },
    assistantShortcut: {
      default: 'Option+S'
    },
    allowAnalytics: {
      default: true
    }
  }
})

if (process.platform !== 'darwin') {
  preferences.set('assistant', false)
}

export default preferences
