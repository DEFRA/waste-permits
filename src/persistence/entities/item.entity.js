'use strict'

const BaseEntity = require('./base.entity')
const ItemType = require('./itemType.entity')

const ACTIVITY = 'wasteactivity'
const ASSESSMENT = 'wasteassessment'

class Item extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_items'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_itemid' },
      { field: 'itemName', dynamics: 'defra_name' },
      { field: 'shortName', dynamics: 'defra_shortname', encode: true },
      { field: 'itemTypeId', dynamics: '_defra_itemtypeid_value', bind: { id: 'defra_itemtypeid', dynamicsEntity: 'defra_itemtypes' } },
      { field: 'code', dynamics: 'defra_code' },
      { field: 'description', dynamics: 'defra_description' },
      { field: 'description2', dynamics: 'defra_description2' },
      { field: 'suffix', dynamics: 'defra_suffix' },
      { field: 'canApplyFor', dynamics: 'defra_canapplyfor' },
      { field: 'canApplyOnline', dynamics: 'defra_canapplyonline' }
    ]
  }

  static async listAssessments (context) {
    const idForAssessmentName = await ItemType.getByShortName(context, ASSESSMENT)
    return this.listBy(context, { itemTypeId: idForAssessmentName.id }, 'itemTypeId')
  }

  static async listActivitiesAndAssessments (context) {
    const itemTypes = await ItemType.listByShortName(context, [ACTIVITY, ASSESSMENT])
    const itemTypeId = itemTypes.map(item => item.id)
    const items = await this.listBy(context, { itemTypeId }, 'itemTypeId')
    return items
  }

  static async getActivity (context, activity) {
    const idForActivityName = await ItemType.getByShortName(context, ACTIVITY)
    const activityEntity = await this.getBy(context, { itemTypeId: idForActivityName.id, shortName: activity })
    return activityEntity
  }

  static async getAssessment (context, assessment) {
    const idForAssessmentName = await ItemType.getByShortName(context, ASSESSMENT)
    const assessmentEntity = await this.getBy(context, { itemTypeId: idForAssessmentName.id, shortName: assessment })
    return assessmentEntity
  }
}

Item.setDefinitions()

module.exports = Item
