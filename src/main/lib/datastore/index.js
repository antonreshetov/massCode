import DB from './datastore'
import store from '../../store'
import {
  FOLDERS_SCHEMA,
  SNIPPETS_SCHEMA,
  TAGS_SCHEMA
} from '../datastore/schema'

const path = store.preferences.get('storagePath')
const backupPath = store.preferences.get('backupPath')
const collections = [
  {
    name: 'folders',
    schema: FOLDERS_SCHEMA
  },
  {
    name: 'snippets',
    schema: SNIPPETS_SCHEMA
  },
  {
    name: 'tags',
    schema: TAGS_SCHEMA
  }
]

const db = new DB({
  path,
  backupPath,
  collections
})

db.createDefaultFolders()
db.autoBackup()

export default db
