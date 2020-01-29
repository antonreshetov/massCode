import { TouchBar } from 'electron'
import { mainWindow } from '../main'

const { TouchBarButton, TouchBarSpacer } = TouchBar

const newSnippet = new TouchBarButton({
  label: 'New Snippet',
  click: () => {
    mainWindow.webContents.send('menu:new-snippet')
  }
})

const newFolder = new TouchBarButton({
  label: 'New Folder',
  click: () => {
    mainWindow.webContents.send('menu:new-folder')
  }
})

const favorites = new TouchBarButton({
  label: 'Favorites',
  click: () => {
    mainWindow.webContents.send('menu:favorites')
  }
})

export default new TouchBar({
  items: [
    newSnippet,
    newFolder,
    new TouchBarSpacer({ size: 'small' }),
    favorites
  ]
})
