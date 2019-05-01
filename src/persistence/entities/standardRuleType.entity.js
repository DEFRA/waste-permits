'use strict'

const { OFFLINE_CATEGORIES } = require('../../constants')
const BaseEntity = require('./base.entity')

// cached results to be loaded on demand
const cache = {}

const convertOfflineCategory = (offlineCategoryEntry) => {
  const { id, category, name: categoryName, hint = '' } = offlineCategoryEntry
  return { id, categoryName, category, hint }
}
const convertStandardRuleType = (standardRuleTypeEntity) => {
  const { id = '', categoryName = '', category = '', hint = '' } = standardRuleTypeEntity
  return { id, categoryName: categoryName.toLowerCase(), category, hint }
}

class StandardRuleType extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_standardruletypes'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_standardruletypeid' },
      { field: 'category', dynamics: 'defra_category' },
      { field: 'hint', dynamics: 'defra_hint' },
      { field: 'categoryName', dynamics: 'defra_name' }
    ]
  }

  static clearCache () {
    Object.keys(cache).forEach((key) => {
      delete cache[key]
    })
  }

  static async getCategories (context) {
    if (!cache.permitCategories) {
      const offlineCategories = Object.values(OFFLINE_CATEGORIES).map((offlineCategory) => convertOfflineCategory(offlineCategory))
      const standardRuleTypeEntities = await StandardRuleType.listBy(context)
      const standardRuleTypes = standardRuleTypeEntities.map((standardRuleType) => convertStandardRuleType(standardRuleType))
      const categories = offlineCategories.concat(standardRuleTypes)

      categories.sort((a, b) => {
        const categoryA = a.category.toLowerCase() // ignore upper and lowercase
        const categoryB = b.category.toLowerCase() // ignore upper and lowercase
        if (categoryA < categoryB) {
          return -1
        } else {
          return 1
        }
      })

      cache.permitCategories = categories
    }
    return cache.permitCategories
  }

  static async getById (context, categoryId) {
    const offlineCategory = Object.values(OFFLINE_CATEGORIES).find(({ id }) => id === categoryId)
    if (offlineCategory) {
      return convertOfflineCategory(offlineCategory)
    } else {
      const standardRuleType = await super.getById(context, categoryId)
      return convertStandardRuleType(standardRuleType)
    }
  }
}

StandardRuleType.setDefinitions()

module.exports = StandardRuleType
