'use strict'

const BaseEntity = require('./base.entity')

const ACTIVITY = 'wasteactivity'
const ASSESSMENT = 'wasteassessment'

class ItemType extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_itemtypes'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_itemtypeid' },
      { field: 'itemTypeName', dynamics: 'defra_name' },
      { field: 'shortName', dynamics: 'defra_shortname', encode: true }
    ]
  }

  static async getByShortName (context, shortName) {
    return super.getBy(context, { shortName })
  }

  static async listByShortName (context, shortName) {
    return super.listBy(context, { shortName })
  }

  static async getActivityAndAssessmentItemTypes (context) {
    const itemTypes = await this.listByShortName(context, [ACTIVITY, ASSESSMENT])
    const types = {}
    itemTypes.forEach((item) => {
      if (item.shortName === ACTIVITY) {
        types.activity = item
      } else if (item.shortName === ASSESSMENT) {
        types.assessment = item
      }
    })
    return types
  }
}

ItemType.setDefinitions()

module.exports = ItemType
