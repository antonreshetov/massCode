const Store = require('electron-store')

const store = new Store({
  schema: {
    bounds: {
      type: 'object',
      default: null
    },
    sidebarWidth: {
      type: 'number',
      default: null
    },
    snippetListWidth: {
      type: 'number',
      default: null
    },
    selectedFolderId: {
      type: 'string',
      default: null
    },
    selectedFolderIds: {
      type: 'string',
      default: null
    },
    selectedSnippetId: {
      type: 'string',
      default: null
    },
    snippetsSort: {
      type: 'string',
      default: 'updateAt'
    },
    storagePath: {
      type: 'string',
      default: 'updateAt'
    },
    theme: {
      type: 'string',
      default: 'dark'
    },
    allowAnalytics: {
      type: 'boolean',
      default: true
    },
    install: {
      type: 'string',
      default: null
    },
    preferences: {
      type: 'object',
      properties: {
        assistant: {
          type: 'object',
          properties: {
            enable: {
              type: 'boolean',
              default: true
            },
            shortcut: {
              type: 'string',
              default: 'Option+S'
            }
          }
        }
      }
    }
  }
})

if (!store.get('preferences')) {
  store.set('preferences', { assistant: {} })
}

export default store
