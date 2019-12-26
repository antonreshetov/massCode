import store from '@/store'
import Mousetrap from 'mousetrap'

export default () => {
  /**
   * Новый сниппет
   */
  Mousetrap.bind(['command+n', 'ctrl+n'], () => {
    const folderId = store.getters['folders/selectedId']
    store.dispatch('snippets/addSnippet', folderId)
  })
}
