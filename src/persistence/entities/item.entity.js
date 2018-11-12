'use strict'

const BaseEntity = require('./base.entity')
const ItemType = require('./itemType.entity')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const LoggingService = require('../../services/logging.service')

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

  static async getAllActivitiesAndAssessments (context) {
    const typeEntityName = ItemType.dynamicsEntity
    const typeIdFieldName = ItemType.id.dynamics
    const typeShortNameFieldName = ItemType.shortName.dynamics
    const itemFieldNames = this.mapping.map(({ dynamics }) => dynamics).join(',')

    const filterCriteria = `${typeShortNameFieldName} eq '${ACTIVITY}' or ${typeShortNameFieldName} eq '${ASSESSMENT}'`

    const typeRelationshipFieldName = 'defra_itemtype_defra_item_itemtypeid'

    const query = `${typeEntityName}?$select=${typeIdFieldName},${typeShortNameFieldName}&$filter=${filterCriteria}&$expand=${typeRelationshipFieldName}($select=${itemFieldNames})`

    const dynamicsDal = new DynamicsDalService(context.authToken)
    try {
      const response = await dynamicsDal.search(query)
      return response.value.reduce((acc, type) => {
        const items = type[typeRelationshipFieldName].map((relatedItem) => this.dynamicsToEntity(relatedItem))
        const typeShortName = type[typeShortNameFieldName]
        if (typeShortName === ACTIVITY) {
          acc.activities = items
        } else if (typeShortName === ASSESSMENT) {
          acc.assessments = items
        }
        return acc
      }, {})
    } catch (error) {
      LoggingService.logError(`Unable to list ${this.name} for all activities and assessments: ${error}`)
      throw error
    }
  }
}

Item.setDefinitions()

module.exports = Item
