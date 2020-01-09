import { app, shell } from 'electron'
const { version, author } = require('../../../package.json')

if (process.platform !== 'win32') {
  app.setAboutPanelOptions({
    applicationName: 'massCode',
    applicationVersion: version,
    version,
    copyright: author
  })
}

export default mainWindow => {
  const massCode = {
    label: 'massCode',
    submenu: [
      {
        label: 'About massCode',
        selector: 'orderFrontStandardAboutPanel:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences',
        accelerator: 'Command+,',
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
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CommandOrControl+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CommandOrControl+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'CommandOrControl+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'CommandOrControl+V',
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
        label: 'GitHub Repo',
        click () {
          shell.openExternal('https://github.com/antonreshetov/massCode')
        }
      }
    ]
  }

  return [massCode, file, edit, editor, window, help]
}
