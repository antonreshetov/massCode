import { app, shell, dialog, BrowserWindow } from 'electron'
import os from 'os'
const { version, author } = require('../../../package.json')

const isMac = process.platform === 'darwin'
const year = new Date().getFullYear()

if (isMac) {
  app.setAboutPanelOptions({
    applicationName: 'massCode',
    applicationVersion: version,
    version,
    copyright: `${author}\n https://masscode.io \n©2019-${year}`
  })
}

function creatMassCodeMenu (mainWindow) {
  if (isMac) {
    return [
      {
        label: 'About massCode',
        selector: 'orderFrontStandardAboutPanel:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences',
        accelerator: 'CommandOrControl+,',
        click () {
          mainWindow.webContents.send('menu:preferences')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide massCode',
        accelerator: 'Command+H',
        selector: 'hide:'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      },
      {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit massCode',
        role: 'quit',
        accelerator: 'CommandOrControl+Q'
      }
    ]
  } else {
    return [
      {
        label: 'Preferences',
        accelerator: 'CommandOrControl+,',
        click () {
          mainWindow.webContents.send('menu:preferences')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit massCode',
        role: 'quit',
        accelerator: 'CommandOrControl+Q'
      }
    ]
  }
}

export default mainWindow => {
  const massCode = {
    label: 'massCode',
    submenu: creatMassCodeMenu(mainWindow)
  }

  const file = {
    label: 'File',
    submenu: [
      {
        label: 'New Snippet',
        accelerator: 'CommandOrControl+N',
        click () {
          mainWindow.webContents.send('menu:new-snippet')
        }
      },
      {
        label: 'New Fragment',
        accelerator: 'CommandOrControl+T',
        click () {
          mainWindow.webContents.send('menu:new-fragment')
        }
      },
      {
        label: 'New Folder',
        accelerator: 'CommandOrControl+Shift+N',
        click () {
          mainWindow.webContents.send('menu:new-folder')
        }
      }
    ]
  }

  const edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CommandOrControl+Z',
        click (menuItem, focusedWin) {
          mainWindow.webContents.send('menu:undo')
          focusedWin.webContents.undo()
        },
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CommandOrControl+Z',
        click (menuItem, focusedWin) {
          mainWindow.webContents.send('menu:redo')
          focusedWin.webContents.redo()
        },
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CommandOrControl+X',
        click (menuItem, focusedWin) {
          mainWindow.webContents.send('menu:cut')
          focusedWin.webContents.cut()
        },
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'CommandOrControl+C',
        click (menuItem, focusedWin) {
          mainWindow.webContents.send('menu:copy')
          focusedWin.webContents.copy()
        },
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'CommandOrControl+V',
        click (menuItem, focusedWin) {
          mainWindow.webContents.send('menu:paste')
          focusedWin.webContents.paste()
        },
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'CommandOrControl+A',
        selector: 'selectAll:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Find',
        accelerator: 'CommandOrControl+F',
        click () {
          mainWindow.webContents.send('menu:find-snippets')
        }
      }
    ]
  }

  const editor = {
    label: 'Editor',
    submenu: [
      {
        label: 'Copy Snippet to Clipboard',
        accelerator: 'Shift+CommandOrControl+C',
        click () {
          mainWindow.webContents.send('menu:copy-snippet')
        }
      },
      {
        label: 'Format',
        accelerator: 'Shift+CommandOrControl+F',
        click () {
          mainWindow.webContents.send('menu:format-snippet')
        }
      },
      {
        label: 'Preview Markdown',
        accelerator: 'Shift+CommandOrControl+M',
        type: 'checkbox',
        checked: false,
        click (e) {
          mainWindow.webContents.send('menu:markdown-preview', e.checked)
        }
      }
    ]
  }

  const window = {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      },
      {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }
    ]
  }

  const help = {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Website',
        click () {
          shell.openExternal('https://masscode.io')
        }
      },
      {
        label: 'Release Notes',
        click () {
          shell.openExternal('https://masscode.io/releases')
        }
      },
      {
        label: 'Documentation',
        click () {
          shell.openExternal('https://masscode.io/documentation')
        }
      },
      {
        label: 'View in GitHub',
        click () {
          shell.openExternal('https://github.com/antonreshetov/massCode')
        }
      },
      {
        label: 'Report Issue',
        click () {
          shell.openExternal(
            'https://github.com/antonreshetov/massCode/issues/new'
          )
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Donate',
        click () {
          shell.openExternal('https://masscode.io/donate')
        }
      },
      {
        label: 'Twitter',
        click () {
          shell.openExternal('https://twitter.com/anton_reshetov')
        }
      },
      {
        label: 'About',
        click () {
          dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
            title: 'massCode',
            message: 'massCode',
            type: 'info',
            detail: `
              Version: ${version}
              Electron: ${process.versions.electron}
              Chrome: ${process.versions.chrome}
              Node.js: ${process.versions.node}
              V8: ${process.versions.v8}
              OS: ${os.type()} ${os.arch()} ${os.release()}

              ©2019-${year} Anton Reshetov <reshetov-art@gmail.com>
            `
          })
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Open Developer Tools',
        accelerator: 'Alt+CommandOrControl+I',
        click () {
          mainWindow.webContents.openDevTools({ mode: 'detach' })
        }
      }
    ]
  }

  return [massCode, file, edit, editor, window, help]
}
