import { ipcRenderer } from 'electron'
import store from '@/store'
import router from '@/router'
import eventBus from '@/event-bus'
import { track } from '@@/lib/analytics'

ipcRenderer.on('menu:new-snippet', () => {
  const folderId = store.getters['folders/selectedId']
  store.dispatch('snippets/addSnippet', { folderId })
  track('snippets/new')
})

ipcRenderer.on('menu:new-fragment', () => {
  const snippetId = store.getters['snippets/selectedId']
  if (snippetId) {
    eventBus.$emit('snippet:new-fragment')
  }
  track('snippets/new-fragment')
})

ipcRenderer.on('menu:new-folder', () => {
  store.dispatch('folders/addFolder')
  track('folders/new')
})

ipcRenderer.on('menu:preferences', () => {
  router.push('/preferences')
  track('view/preferences')
})

ipcRenderer.on('menu:find-snippets', () => {
  eventBus.$emit('menu:find-snippets')
  track('snippets/search')
})

ipcRenderer.on('menu:copy-snippet', () => {
  eventBus.$emit('menu:copy-snippet')
  track('snippets/copied')
})

ipcRenderer.on('menu:format-snippet', () => {
  eventBus.$emit('menu:format-snippet')
})

ipcRenderer.on('menu:markdown-preview', (e, value) => {
  store.commit('app/SET_MARKDOWN_PREVIEW', value)
})

ipcRenderer.on('menu:favorites', () => {
  store.dispatch('folders/setSelectedFolderById', 'favorites')
})

ipcRenderer.on('update-available', () => {
  store.commit('app/SET_UPDATE_AVAILABLE', true)
})
