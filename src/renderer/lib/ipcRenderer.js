import { ipcRenderer } from 'electron'
import store from '@/store'
import eventBus from '@/event-bus'

ipcRenderer.on('menu:new-snippet', () => {
  const folderId = store.getters['folders/selectedId']
  store.dispatch('snippets/addSnippet', folderId)
})

ipcRenderer.on('menu:new-fragment', () => {
  const snippetId = store.getters['snippets/selectedId']
  if (snippetId) {
    eventBus.$emit('snippet:new-fragment')
  }
})

ipcRenderer.on('menu:new-folder', () => {
  store.dispatch('folders/addFolder')
})

ipcRenderer.on('menu:preferences', () => {
  store.commit('app/SET_VIEW', 'preferences')
})

ipcRenderer.on('menu:find-snippets', () => {
  eventBus.$emit('menu:find-snippets')
})
