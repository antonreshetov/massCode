import cloneDeep from 'lodash-es/cloneDeep'

/**
 * Удаление технических полей базы данных
 * @param obj - объект
 * @returns {Object} - объект без технических полей
 */
export function deleteTechProps (obj) {
  obj = cloneDeep(obj)

  delete obj._id
  delete obj.children
  delete obj.tags
  delete obj.folder
  delete obj.createdAt
  delete obj.updatedAt

  return obj
}
