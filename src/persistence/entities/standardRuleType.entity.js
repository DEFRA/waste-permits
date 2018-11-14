'use strict'

const { OFFLINE_CATEGORIES } = require('../../constants')
const BaseEntity = require('./base.entity')

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

  static async list (context) {
    return this.listBy(context, {}, 'category')
  }

  static async getCategories (context) {
    const categories = Object.keys(OFFLINE_CATEGORIES)
      .map((key) => {
        const { id, category, name: categoryName, hint = '' } = OFFLINE_CATEGORIES[key]
        return { id, categoryName, category, hint }
      })

    const standardRuleTypes = await StandardRuleType.list(context)
    standardRuleTypes.forEach(({ id = '', categoryName = '', category = '', hint = '' }) => {
      categories.push({ id, categoryName: categoryName.toLowerCase(), category, hint })
    })

    categories.sort((a, b) => {
      const categoryA = a.category.toLowerCase() // ignore upper and lowercase
      const categoryB = b.category.toLowerCase() // ignore upper and lowercase
      if (categoryA < categoryB) {
        return -1
      } else {
        return 1
      }
    })

    return categories
  }
}

StandardRuleType.setDefinitions()

module.exports = StandardRuleType
