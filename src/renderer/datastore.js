import Store from 'nedb'
import path from 'path'
import { remote } from 'electron'
import electronStore from '@@/store'
import store from '@/store'
import fs from 'fs-extra'

class DataStore {
  constructor () {
    this._defaultPath = remote.app.getPath('home') + '/massCode'
    this._storedPath = electronStore.get('storagePath')
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

    store.commit('app/SET_STORAGE_PATH', this._path)
  }

  updatePath () {
    this._storedPath = electronStore.get('storagePath')
    this._path = this._storedPath || this._defaultPath
    this.init()
  }

  import (from) {
    electronStore.set('storagePath', from)
    this.updatePath()
  }

  async move (to) {
    try {
      await fs.move(this._path, to, { overwrite: true })
      electronStore.set('storagePath', to)
      this.updatePath()
    } catch (err) {
      console.error(err)
    }
  }
}

const db = new DataStore()

export default db
