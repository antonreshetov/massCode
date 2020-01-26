import Store from 'nedb'
import path from 'path'
import { remote } from 'electron'
import electronStore from '@@/store'
import fs from 'fs-extra'
import shortid from 'shortid'

class DataStore {
  constructor () {
    this._defaultPath = remote.app.getPath('home') + '/massCode'
    this._storedPath = electronStore.preferences.get('storagePath')
    this._path = this._storedPath || this._defaultPath

    this.init()
  }

  init () {
    this.snippets = new Store({
      autoload: true,
      filename: path.join(this._path, '/snippets.db')
    })
    this.tags = new Store({
      autoload: true,
      filename: path.join(this._path, '/tags.db')
    })
    this.masscode = new Store({
      autoload: true,
      filename: path.join(this._path, '/masscode.db')
    })
  }

  updatePath () {
    this._storedPath = electronStore.preferences.get('storagePath')
    this._path = this._storedPath || this._defaultPath
    this.init()
  }

  import (from) {
    electronStore.preferences.set('storagePath', from)
    this.updatePath()
  }

  move (to) {
    return new Promise((resolve, reject) => {
      const dbFiles = ['masscode.db', 'snippets.db', 'tags.db']
      const src = dbFiles.map(i => path.resolve(this._path, i))
      const dist = dbFiles.map(i => path.resolve(to, i))

      fs.readdir(to, (err, files) => {
        if (err) reject(err)

        const isExist = dbFiles.some(i => files.includes(i))

        if (isExist) {
          reject(new Error('Folder already contains db files.'))
        }

        src.forEach((file, index) => {
          fs.moveSync(file, dist[index])
        })
        electronStore.preferences.set('storagePath', to)
        this.updatePath()
        resolve()
      })
    })
  }
}

const db = new DataStore()

const defaultFolder = {
  list: [
    {
      id: shortid(),
      name: 'Default',
      open: false,
      defaultLanguage: 'text'
    }
  ],
  _id: 'folders'
}

db.masscode.insert(defaultFolder)

export default db
