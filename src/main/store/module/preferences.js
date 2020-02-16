import Store from 'electron-store'
import { homedir, platform } from 'os'

const isWin = platform() === 'win32'

const defaultPath = isWin ? homedir() + '\\massCode' : homedir() + '/massCode'
const backupPath = isWin ? `${defaultPath}\\backups` : `${defaultPath}/backups`

const preferences = new Store({
  name: 'preferences',
  cwd: 'massCode',

  schema: {
    storagePath: {
      default: defaultPath
    },
    backupPath: {
      default: backupPath
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
    renderWhitespace: {
      default: 'none'
    },
    wordWrap: {
      default: 'off'
    },
    tabSize: {
      default: 2
    },
    insertSpaces: {
      default: true
    },
    prettierSemi: {
      default: false
    },
    prettierQuotes: {
      default: true
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
