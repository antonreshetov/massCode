const Store = require('electron-store')

const store = new Store({
  schema: {
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
