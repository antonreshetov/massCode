import Store from 'nedb'
import path from 'path'
import electronStore from '@@/store'
import fs from 'fs-extra'
import shortid from 'shortid'
import { format, min, max, isSameDay } from 'date-fns'
import rimraf from 'rimraf'
import junk from 'junk'

class DataStore {
  constructor () {
    this._path = electronStore.preferences.get('storagePath')
    this._backupPath = electronStore.preferences.get('backupPath')
    this._backupLimit = 30
    this._dbFiles = ['masscode.db', 'snippets.db', 'tags.db']

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
    this._path = electronStore.preferences.get('storagePath')
    this.init()
  }

  import (from) {
    electronStore.preferences.set('storagePath', from)
    this.updatePath()
  }

  move (to) {
    return new Promise((resolve, reject) => {
      const src = this._dbFiles.map(i => path.resolve(this._path, i))
      const dist = this._dbFiles.map(i => path.resolve(to, i))

      fs.readdir(to, (err, files) => {
        if (err) reject(err)

        const isExist = this._dbFiles.some(i => files.includes(i))

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

  compact () {
    this.masscode.persistence.compactDatafile()
    this.snippets.persistence.compactDatafile()
    this.tags.persistence.compactDatafile()
  }

  createBackupDirByDate (date) {
    date = date || new Date()
    const backupFolderDatePattern = 'yyyy-MM-dd_HH-mm-ss'
    const suffixFolder = 'massCode'
    const dirName = `${format(date, backupFolderDatePattern)}_${suffixFolder}`

    return path.resolve(this._backupPath, dirName)
  }

  async backup () {
    const dir = this.createBackupDirByDate()
    const src = this._dbFiles.map(i => path.resolve(this._path, i))
    const dest = this._dbFiles.map(i => path.resolve(dir, i))

    this.compact()

    await fs.ensureDir(dir)

    src.forEach((file, index) => {
      fs.copy(file, dest[index])
    })
  }

  autoBackup () {
    const start = async () => {
      const now = new Date()
      const isEmpty = await this.isBackupEmpty()

      if (isEmpty) {
        await this.backup()
      } else {
        const { date } = await this.getLatestBackupDir()

        if (!isSameDay(now, date)) {
          await this.removeEarliestBackup()
          await this.backup()
        }
      }
      console.log('autobackup is started')
    }

    start()
    setInterval(() => {
      start()
    }, 1000 * 60 * 60 * 12)
  }

  restoreFromBackup (date) {
    return new Promise((resolve, reject) => {
      const dir = this.createBackupDirByDate(date)
      const src = this._dbFiles.map(i => path.resolve(dir, i))
      const dest = this._dbFiles.map(i => path.resolve(this._path, i))

      src.forEach((file, index) => {
        fs.copySync(file, dest[index])
      })

      this.init()
      resolve()
    })
  }

  async moveBackup (to) {
    const dirs = await this.getBackupDirs()
    const src = dirs.map(i => path.resolve(this._backupPath, i))
    const dest = dirs.map(i => path.resolve(to, i))

    src.forEach((dir, index) => {
      fs.moveSync(dir, dest[index], { overwrite: true })
    })

    this._backupPath = to
    electronStore.preferences.set('backupPath', to)
  }

  async getBackupDirs () {
    let dirs = await fs.readdir(this._backupPath)
    dirs = dirs.filter(junk.not).filter(i => i.includes('massCode'))

    return dirs
  }

  async getBackupsDirsAsDate () {
    const dirs = await this.getBackupDirs()
    return this.convertBackupDirsToDate(dirs.filter(junk.not))
  }

  async getEarliestBackupDir () {
    const dirs = await this.getBackupDirs()

    const dirsDate = this.convertBackupDirsToDate(dirs)
    const minDate = min(dirsDate).getTime()
    const dir = dirs[dirsDate.indexOf(minDate)]

    return {
      date: minDate,
      dir,
      path: dir ? path.resolve(this._backupPath, dir) : null
    }
  }

  async getLatestBackupDir () {
    const dirs = await this.getBackupDirs()

    const dirsDate = this.convertBackupDirsToDate(dirs)
    const maxDate = max(dirsDate).getTime()
    const dir = dirs[dirsDate.indexOf(maxDate)]

    return {
      date: maxDate,
      dir,
      path: dir ? path.resolve(this._backupPath, dir) : null
    }
  }

  async removeEarliestBackup () {
    const dirs = await this.getBackupDirs()
    const { path } = await this.getEarliestBackupDir()

    if (dirs.length > this._backupLimit) {
      rimraf(path, err => {
        if (err) throw Error(err)
      })
    }
  }

  convertBackupDirsToDate (dirs) {
    return dirs.map(i => {
      const arr = i.split('_').splice(0, 2)
      arr[1] = `T${arr[1].replace(/-/g, ':')}`
      const date = new Date(arr.join('')).getTime()

      return date
    })
  }

  async isBackupEmpty () {
    let dirs = await this.getBackupDirs()
    dirs = dirs.filter(junk.not)

    return dirs.length === 0
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
db.autoBackup()

export default db
