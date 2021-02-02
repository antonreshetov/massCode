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

  return flatList.map(({ children, ...rest }) => rest)
}
/**
 * Конвертация плоского строения дерева во вложенный через 'children'
 * @param {Array} items - массив элементов c полями связей
 * с родительскими элементами
 * @param {String} id - ID элемента
 * @param {String} idLink - имя свойства ID
 * @param {String} link - имя связанного поля
 * @example [{id:1, parentId: null }, {id:2, parentId: 1 }] -> [{id:1, children: [id:2] }]
 */
export function flatToNested (
  items,
  id = null,
  idLink = '_id',
  link = 'parentId'
) {
  return items
    .filter(item => item[link] === id)
    .map(item => ({
      ...item,
      children: flatToNested(items, item[idLink])
    }))
}
