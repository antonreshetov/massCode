import Store from 'electron-store'

const app = new Store({
  name: 'app',
  cwd: 'massCode',

  schema: {
    bounds: {
      default: null
    },
    sidebarWidth: {
      default: null
    },
    snippetListWidth: {
      default: null
    },
    selectedFolderId: {
      default: null
    },
    selectedFolderIds: {
      default: null
    },
    selectedSnippetId: {
      default: null
    },
    snippetsSort: {
      default: 'updateAt'
    },
    install: {
      default: null
    },
    updateAvailable: {
      default: false
    }
  }
})

export default app
