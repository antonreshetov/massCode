export function defaultLibraryQuery (query = {}, id) {
  if (id === 'trash') {
    query = { isDeleted: true }
  }
  if (id === 'favorites') {
    query = { isFavorites: true }
  }
  if (id === 'allSnippets') {
    query = {}
  }
  if (id === 'inBox') {
    query = { folderId: null }
  }
  return query
}
