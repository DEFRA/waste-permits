'use strict'

const BaseEntity = require('./base.entity')

class ApplicationLine extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_applicationlines'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_applicationlineid', readOnly: true },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationId', dynamicsEntity: 'defra_applications' } },
      { field: 'standardRuleId', dynamics: '_defra_standardruleid_value', bind: { id: 'defra_standardruleId', dynamicsEntity: 'defra_standardrules' } },
      { field: 'itemId', dynamics: '_defra_itemid_value', bind: { id: 'defra_itemid', dynamicsEntity: 'defra_items' } },
      { field: 'parametersId', dynamics: '_defra_parametersid_value', readOnly: true },
      { field: 'value', dynamics: 'defra_value', readOnly: true },
      { field: 'permitType', dynamics: 'defra_permittype' }
    ]
  }

  static async getByApplicationId (context) {
    const { applicationId } = context
    return super.getBy(context, { applicationId })
  }
}

ApplicationLine.setDefinitions()

module.exports = ApplicationLine
