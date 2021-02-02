import { v4 as uuid } from 'uuid'
import cloneDeep from 'lodash-es/cloneDeep'
import merge from 'lodash-es/merge'
import { deleteTechProps } from './helpers'

const extendMethods = {
  /**
   * Добавление документа в коллекцию
   * @param doc {Object} - Документ
   */
  $insert (doc, customId = false) {
    const { error, value } = this._schema.validate(doc)

    if (error) {
      throw new Error(error)
    } else {
      doc = value
      doc._id = uuid()
      doc.createdAt = new Date().getTime()
      doc.updatedAt = new Date().getTime()
      this.push(doc).write()
      return this.$findOne({ _id: doc._id })
    }
  },
  /**
   * Поиск по фильтру с возвратом списка документов
   * @param filter {Object} - Фильтр поиска
   * @returns {Array} - Список найденных документов
   */
  $find (filter = {}) {
    return this.filter(filter)
      .cloneDeep()
      .value()
  },
  /**
   * Поиск по фильтру с возвратом документа
   * @param filter {Object} - Фильтр поиска
   * @returns {Object} - Найденный документ
   */
  $findOne (filter = {}) {
    return this.find(filter)
      .cloneDeep()
      .value()
  },
  /**
   * Обновление документа по ID
   * @param filter {Object} - Фильтр поиска
   * @param update - {Object} - Обновления для документа
   * @returns {Object} - Патч обновление
   */
  $findOneAndUpdate (filter, update) {
    const doc = this.find(filter)
    const docData = doc.cloneDeep().value()
    const updatedDoc = merge(deleteTechProps(docData), deleteTechProps(update))

    const { error } = this._schema.validate(updatedDoc)

    if (error) {
      throw new Error(error)
    } else {
      doc
        .assign(updatedDoc)
        .set('updatedAt', new Date().getTime())
        .write()

      return doc
    }
  },
  /**
   * Агрегация значений
   * @param pipeline[].$match {Object} - Фильтр поиска
   * @param pipeline[].$lookup {Object} - Присоединение коллекции
   */
  $aggregate (pipeline = []) {
    let docs = []
    console.group('$aggregate')
    pipeline.forEach(pipe => {
      for (const [k, v] of Object.entries(pipe)) {
        console.log(k, v)
        // $match принимает следующие значения:
        // Простые
        // - key: value
        // Комплексные
        // - key: {$in: []}
        // - key: {$elemMatch: []}
        if (k === '$match') {
          const simpleKV = {}
          for (const [kM, vM] of Object.entries(v)) {
            console.log(kM, vM)
            if (typeof vM !== 'object') simpleKV[kM] = vM
            // console.log('simpleKV', simpleKV)
            if (vM.$in) {
              // Найти все сниппеты у которых в поле kM (например folderId)
              // присутствует одно из vM.$in значений
              console.group('$in')
              const docsVm = vM.$in.reduce((acc, item) => {
                // console.log({ [kM]: item })
                const query = {
                  ...simpleKV,
                  [kM]: item
                }
                console.log('query', query)
                const doc = this.filter(query)
                  .cloneDeep()
                  .value()
                acc.push(...doc)
                return acc
              }, [])
              console.log(docsVm)
              console.groupEnd()
              docs = [...docs, ...docsVm]
            } else if (vM.$elemMatch) {
              // Найти все сниппеты у которых в поле-массиве kM (например tagIds)
              // присутствует одно из vM.$elemMatch значений
              const docsVm = this.filter({})
                .cloneDeep()
                .value()
                .reduce((acc, item) => {
                  if (item.tagIds.includes(vM.$elemMatch)) {
                    acc.push(item)
                  }
                  return acc
                }, [])
              docs = [...docs, ...docsVm]
              console.log(docsVm)
              console.group('$elemMatch')
              console.warn(kM, vM)
              console.groupEnd()
            } else {
              docs = this.filter(v)
                .cloneDeep()
                .value()
            }
          }

          if (!Object.keys(v).length) {
            console.log('query', v)
            docs = this.filter(v)
              .cloneDeep()
              .value()
          }
        }

        if (k === '$lookup') {
          if (docs) {
            // Присоединенная коллекция
            const collection = this.__wrapped__[v.from]

            docs.map(doc => {
              let populate

              if (Array.isArray(doc[v.localField])) {
                populate = doc[v.localField].map(id => {
                  return collection.find(i => i[v.foreignField] === id)
                })
              } else {
                populate = collection.find(
                  i => i[v.foreignField] === doc[v.localField]
                )
              }

              if (populate) doc[v.as] = cloneDeep(populate)

              return doc
            })
          }
        }

        if (k === '$sort') {
          for (const [sK, sV] of Object.entries(v)) {
            if (docs) {
              sV === 1
                ? docs.sort((a, b) => (a[sK] > b[sK] ? -1 : 1))
                : docs.sort((a, b) => (a[sK] < b[sK] ? 1 : -1))
            }
          }
        }

        if (k === '$limit') {
          docs = docs.slice(0, v)
        }

        if (k === '$skip') {
          docs = docs.slice(v)
        }
      }
    })
    console.groupEnd()
    return docs
  }
}

export default extendMethods
