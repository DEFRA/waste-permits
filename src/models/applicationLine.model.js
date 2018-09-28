'use strict'

const { PermitTypes } = require('../dynamics')
const BaseModel = require('./base.model')

class ApplicationLine extends BaseModel {
  static get entity () {
    return 'defra_applicationlines'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_applicationlineid', readOnly: true },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationId', entity: 'defra_applications' } },
      { field: 'standardRuleId', dynamics: '_defra_standardruleid_value', bind: { id: 'defra_standardruleId', entity: 'defra_standardrules' } },
      { field: 'parametersId', dynamics: '_defra_parametersid_value', readOnly: true },
      { field: 'value', dynamics: 'defra_value', readOnly: true },
      { field: 'permitType', dynamics: 'defra_permittype', constant: PermitTypes.STANDARD }
    ]
  }

  static async getByApplicationId (context, applicationId) {
    return super.getBy(context, { applicationId })
  }
}

ApplicationLine.setDefinitions()

module.exports = ApplicationLine
