import Store from 'electron-store'
import { homedir } from 'os'

const preferences = new Store({
  name: 'preferences',
  cwd: 'massCode',

  schema: {
    storagePath: {
      default: homedir() + '/massCode'
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
