/**
 * Конвертация вложенного строения дерева с 'children' в плоское
 * @param {Array} items - массив элементов
 * @param {String} link - связь по полю
 * @returns {Array} - плоский массив со связями по полю 'parentId'
 */
export function nestedToFlat (items, link = 'id') {
  const flatList = []

  function flat (items) {
    items.map(i => {
      if (i.children && i.children.length) {
        const children = i.children.map(item => {
          return {
            ...item,
            parentId: i[link]
          }
        })

        flatList.push(...children)

        if (!flatList.find(l => l[link] === i[link])) {
          flatList.push({
            ...i,
            parentId: null
          })
        }

        flat(i.children)
      }
    })
  }

  flat(items)

  return flatList
    .map(({
      children,
      ...rest
    }) => rest)
}
/**
 * Конвертация плоского строения дерева в вложенный через 'children'
 * @param {Array} items - массив элементов
 * @param {String} id - ID элемента
 * @param {String} link - связь по полю
 */
export function flatToNested (items, id = null, link = 'parentId') {
  return items
    .filter(item => item[link] === id)
    .map(item => ({
      ...item,
      children: flatToNested(items, item.id)
    }))
}
