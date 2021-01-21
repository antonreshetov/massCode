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
    this.schema = Joi
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
      { name: 'Inbox', isSystem: true, alias: 'inbox' },
      { name: 'Favorites', isSystem: true, alias: 'favorites' },
      { name: 'All Snippets', isSystem: true, alias: 'allSnippets' },
      { name: 'Trash', isSystem: true, alias: 'trash' }
    ]
    const defaultFolder = {
      name: 'Default',
      defaultLanguage: 'text'
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

  async migrate (path) {
    if (!path) throw Error('"path" is required')

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
      })
      this.migrateStore.folderIdsMap.map(([oldId, newId]) => {
        this.collections.folders
          .find({ parentId: oldId })
          .assign({ parentId: newId })
          .write()
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
          .value()

        snippetsWithTags.map(s => {
          const { _id, tagIds } = s
          pull(tagIds, oldId)
          tagIds.push(newId)
          this.collections.snippets
            .find({ _id })
            .assign(tagIds)
            .write()
        })
      })

      resolve(console.log('Migrate from v1 is completed'))
    })
  }
}

export default Datastore
