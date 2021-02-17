import Joi from '@hapi/joi'

export const FOLDERS_SCHEMA = {
  name: Joi.string().required(),
  defaultLanguage: Joi.string(),
  parentId: Joi.string()
    .allow(null)
    .required(),
  index: Joi.number().allow(null),
  open: Joi.boolean().default(false),
  isSystem: Joi.boolean().default(false),
  alias: Joi.string()
}

export const SNIPPETS_SCHEMA = {
  name: Joi.string().required(),
  content: Joi.array().default([]),
  folderId: Joi.string()
    .default(null)
    .allow(null),
  tagIds: Joi.array().default([]),
  isFavorites: Joi.boolean().default(false),
  isDeleted: Joi.boolean().default(false)
}

export const TAGS_SCHEMA = {
  name: Joi.string().required()
}
