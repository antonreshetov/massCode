import low from 'lowdb'
import fs from 'fs-extra'
import path from 'path'
import readline from 'readline'
import FileSync from 'lowdb/adapters/FileSync'
import Joi from '@hapi/joi'
import extendMethods from './extend-methods'
import electronStore from '../../store'
import { nestedToFlat } from '../../util/helpers'
import pull from 'lodash-es/pull'
import { format, min, max, isSameDay } from 'date-fns'
import junk from 'junk'
import rimraf from 'rimraf'

class Datastore {
  /**
   * @param config.path - path to file (required)
   * @param config.backupPath - path to backup folder (required)
   * @param config.collections - collections
   */
  constructor (config) {
    this.initPath(config)

    this.db = low(new FileSync(`${this.path}/db.json`))
    this.collections = {}
    this.backupLimit = 30
    this.migrateStore = {}

    this.createCollections(config.collections)
  }

  initPath (config) {
    if (!config.path) throw Error('config.path is required')
    if (!config.backupPath) throw Error('config.backupPath is required')

    fs.ensureDirSync(config.path)
    fs.ensureDirSync(config.backupPath)

    this.path = config.path
    this.backupPath = config.backupPath
  }

  createCollections (collections = []) {
    if (collections.length) {
      const collectionsObj = {}

      for (const i of collections) {
        collectionsObj[i.name] = []
      }

      this.db.defaults(collectionsObj).write()

      for (const { name, schema } of collections) {
        this.collections[name] = this.db.get(name)
        this.collections[name]._name = name
        this.collections[name]._schema = Joi.object(schema)

        for (const m in extendMethods) {
          this.collections[name][m] = extendMethods[m]
        }
      }
    }
  }

  updateCollections () {
    Object.entries(this.collections).map(([p, v]) => {
      this.collections[p] = this.db.get(p)
      this.collections[p]._name = v._name
      this.collections[p]._schema = v._schema

      for (const m in extendMethods) {
        this.collections[p][m] = extendMethods[m]
      }
    })
  }

  clearCollections () {
    Object.keys(this.collections).map(i => this.db.set(i, []).write())
  }

  createDefaultFolders () {
    if (this.collections.folders.size().value()) return

    const systemFolders = [
      { name: 'Inbox', isSystem: true, parentId: null, alias: 'inbox' },
      { name: 'Favorites', isSystem: true, parentId: null, alias: 'favorites' },
      {
        name: 'All Snippets',
        isSystem: true,
        parentId: null,
        alias: 'allSnippets'
      },
      { name: 'Trash', isSystem: true, parentId: null, alias: 'trash' }
    ]
    const defaultFolder = {
      name: 'Default',
      parentId: null,
      defaultLanguage: 'text',
      index: -1
    }
    const folders = [...systemFolders, defaultFolder]

    folders.map(i => {
      this.collections.folders.$insert(i)
    })
  }

  import (from) {
    electronStore.preferences.set('storagePath', from)
    this.updatePath(from)
  }

  move (to) {
    return new Promise((resolve, reject) => {
      const src = path.resolve(`${this.path}/db.json`)
      const dist = path.resolve(to, 'db.json')

      console.warn(src, dist)

      fs.readdir(to, (err, files) => {
        console.log(files)
        if (err) reject(err)

        if (files.includes('db.json')) {
          reject(new Error('Folder already contains DB.'))
        }
        fs.moveSync(src, dist)
        electronStore.preferences.set('storagePath', to)
        this.updatePath(to)
        resolve()
      })
    })
  }

  async updatePath (path) {
    this.path = path
    this.db = low(new FileSync(`${path}/db.json`))
    this.updateCollections()
  }

  // Backup

  async createBackupDirByDate (date) {
    const folderPath = this.convertDateToBackupPath(date)
    await fs.ensureDir(folderPath)

    return folderPath
  }

  convertDateToBackupPath (date) {
    date = date || new Date()
    const backupFolderDatePattern = 'yyyy-MM-dd_HH-mm-ss'
    const suffixFolder = 'massCode_v2'
    const dirName = `${format(date, backupFolderDatePattern)}_${suffixFolder}`

    return path.resolve(this.backupPath, dirName)
  }

  async backup () {
    const dir = await this.createBackupDirByDate()
    const src = path.resolve(`${this.path}/db.json`)
    const dest = path.resolve(dir, 'db.json')

    await fs.copy(src, dest)
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
      const dir = this.convertDateToBackupPath(date)
      fs.copyFileSync(`${dir}/db.json`, `${this.path}/db.json`)
      this.updatePath(this.path)
      resolve()
    })
  }

  async moveBackup (to) {
    const dirs = await this.getBackupDirs()
    const src = dirs.map(i => path.resolve(this.backupPath, i))
    const dest = dirs.map(i => path.resolve(to, i))

    src.forEach((dir, index) => {
      fs.moveSync(dir, dest[index], { overwrite: true })
    })

    this.backupPath = to
    electronStore.preferences.set('backupPath', to)
  }

  async getBackupDirs () {
    let dirs = await fs.readdir(this.backupPath)
    dirs = dirs.filter(junk.not).filter(i => i.includes('massCode_v2'))

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
      path: dir ? path.resolve(this.backupPath, dir) : null
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
      path: dir ? path.resolve(this.backupPath, dir) : null
    }
  }

  async removeEarliestBackup () {
    const dirs = await this.getBackupDirs()
    const { path } = await this.getEarliestBackupDir()

    if (dirs.length > this.backupLimit) {
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

  // Migrate

  async migrate (path) {
    if (!path) throw Error('"path" is required')

    const files = await fs.readdir(path)
    const migrateFiles = ['masscode.db', 'snippets.db', 'tags.db']

    const isFilesExist = migrateFiles
      .reduce((acc, item) => {
        acc.push(files.includes(item))
        return acc
      }, [])
      .every(i => i === true)

    if (!isFilesExist) throw Error('DB files not exist in this folder')

    console.log('Migrate from v1 is started')
    this.clearCollections()
    this.createDefaultFolders()

    const convertDBToJSON = async file => {
      const readInterface = readline.createInterface({
        input: fs.createReadStream(`${path}/${file}.db`),
        output: process.stdout,
        console: false
      })
      const arr = []

      return new Promise((resolve, reject) => {
        readInterface.on('line', line => {
          if (line) arr.push(JSON.parse(line))
        })

        readInterface.on('close', () => {
          resolve(arr)
        })
      })
    }

    const masscodeJSON = await convertDBToJSON('masscode')
    const snippetsJSON = await convertDBToJSON('snippets')
    const tagsJSON = await convertDBToJSON('tags')
    const masscodeJSONList = nestedToFlat(masscodeJSON[0].list)

    this.migrateStore.folderIdsMap = []
    this.migrateStore.tagIdsMap = []

    return new Promise((resolve, reject) => {
      // Folders
      masscodeJSONList.map(({ id, ...rest }) => {
        const { _id } = this.collections.folders.$insert(rest)

        this.migrateStore.folderIdsMap.push([id, _id])
        this.migrateStore.folderIdsMap.map(([oldId, newId]) => {
          this.collections.folders
            .find({ parentId: oldId })
            .assign({ parentId: newId })
            .write()
        })
      })
      // Snippets
      snippetsJSON.map(
        ({
          _id,
          tags,
          folderId,
          createdAt,
          updatedAt,
          folder,
          tagsPopulated,
          ...rest
        }) => {
          const [, newId] =
            this.migrateStore.folderIdsMap.find(item =>
              item.includes(folderId)
            ) || []

          this.collections.snippets.$insert({
            ...rest,
            tagIds: tags,
            folderId: newId || null
          })
        }
      )
      // Tags
      tagsJSON.map(({ _id: oldId, ...rest }) => {
        const { _id } = this.collections.tags.$insert(rest)
        this.migrateStore.tagIdsMap.push([oldId, _id])
      })

      this.migrateStore.tagIdsMap.map(([oldId, newId]) => {
        const snippetsWithTags = this.collections.snippets
          .filter(i => i.tagIds.includes(oldId))
          .cloneDeep()
          .value()

        snippetsWithTags.map(s => {
          const { _id, tagIds } = s
          pull(tagIds, oldId)
          tagIds.push(newId)
          this.collections.snippets
            .find({ _id })
            .assign({ tagIds })
            .write()
        })
      })

      resolve(console.log('Migrate from v1 is completed'))
    })
  }
}

export default Datastore
