'use strict'

const BaseEntity = require('./base.entity')

const mapping = [
  { field: 'id', dynamics: 'defra_applicationlineid', readOnly: true },
  { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationId', dynamicsEntity: 'defra_applications' } },
  { field: 'standardRuleId', dynamics: '_defra_standardruleid_value', bind: { id: 'defra_standardruleId', dynamicsEntity: 'defra_standardrules' } },
  { field: 'itemId', dynamics: '_defra_itemid_value', bind: { id: 'defra_itemid', dynamicsEntity: 'defra_items' } },
  { field: 'parametersId', dynamics: '_defra_parametersid_value', readOnly: true },
  { field: 'value', dynamics: 'defra_value', readOnly: true },
  { field: 'permitType', dynamics: 'defra_permittype' },
  { field: 'lineName', dynamics: 'defra_name' },
  { field: 'displayOrder', dynamics: 'defra_displayorder' },
  { field: 'discountType', dynamics: 'defra_discounttype' }
]

const queryFieldNames = mapping.map(({ field, dynamics, bind }) => {
  if (field === 'parametersId') {
    return 'defra_parametersid'
  } else {
    return bind ? bind.id.toLowerCase() : dynamics
  }
})
const ATTRIBUTE_LIST = queryFieldNames.map((queryFieldName) => `<attribute name='${queryFieldName}'/>`).join('')

const listForItemTypeQuery = (applicationId, itemType) => {
  return `
  <fetch version='1.0' mapping='logical'>
    <entity name='defra_applicationline'>
      ${ATTRIBUTE_LIST}
      <order attribute='defra_itemid'/>
      <order attribute='createdon'/>
      <filter>
        <condition attribute='defra_applicationid' operator='eq' value='${applicationId}'/>
      </filter>
      <link-entity name='defra_item' to='defra_itemid'>
        <link-entity name='defra_itemtype' to='defra_itemtypeid'>
          <filter>
            <condition attribute='defra_shortname' operator='eq' value='${itemType}'/>
          </filter>
        </link-entity>
      </link-entity>
    </entity>
  </fetch>
  `.replace(/\n\s+/g, '')
}

class ApplicationLine extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_applicationlines'
  }

  static get mapping () {
    return mapping
  }

  static async getByApplicationId (context) {
    const { applicationId } = context
    return super.getBy(context, { applicationId })
  }

  static async listForWasteActivities (context) {
    const { applicationId } = context
    return this.listUsingFetchXml(context, listForItemTypeQuery(applicationId, 'wasteactivity'))
  }
}

ApplicationLine.setDefinitions()

module.exports = ApplicationLine
