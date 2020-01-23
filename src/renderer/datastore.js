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

  async move (to) {
    try {
      await fs.move(this._path, to, { overwrite: true })
      electronStore.preferences.set('storagePath', to)
      this.updatePath()
    } catch (err) {
      console.error(err)
    }
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
