'use strict'

const {PermitTypes} = require('../dynamics')
const LoggingService = require('../services/logging.service')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')

const RuleSet = {
  BASELINE_REPORT: {
    RuleSetId: 'defra_baselinereportreq',
    CompletedId: 'defra_baselinereportreq_completed'
  },
  CONFIRM_CONFIDENTIALLY: {
    RuleSetId: 'defra_cnfconfidentialityreq',
    CompletedId: 'defra_cnfconfidentialityreq_completed'
  },
  CONFIRM_RULES: {
    RuleSetId: 'defra_confirmreadrules',
    CompletedId: 'defra_confirmreadrules_completed'
  },
  CONTACT_DETAILS: {
    RuleSetId: 'defra_contactdetailsrequired',
    CompletedId: 'defra_contactdetailsrequired_completed'
  },
  DEFRA_WASTE_WEIGHT: {
    RuleSetId: 'defra_extwasteweightreq',
    CompletedId: 'defra_extwasteweightreq_completed'
  },
  FIRE_PREVENTION_PLAN: {
    RuleSetId: 'defra_fireplanrequired',
    CompletedId: 'defra_fireplanrequired_completed'
  },
  INVOICING_DETAILS: {
    RuleSetId: 'defra_invoicingdetailsrequired',
    CompletedId: 'defra_invoicingdetails_completed'
  },
  MANAGEMENT_SYSTEM: {
    RuleSetId: 'defra_mansystemrequired',
    CompletedId: 'defra_mansystemrequired_completed'
  },
  MINING_WASTE_MANAGEMENT_PLAN: {
    RuleSetId: 'defra_miningwastemanplanreq',
    CompletedId: 'defra_miningwastemanplanreq_completed'
  },
  NHS_SCREENING: {
    RuleSetId: 'defra_nhscreeningrequired',
    CompletedId: 'defra_nhscreeningrequired_completed'
  },
  PERMIT_HOLDER_DETAILS: {
    RuleSetId: 'defra_pholderdetailsrequired',
    CompletedId: 'defra_pholderdetailsrequired_completed'
  },
  PRE_APPLICATION: {
    RuleSetId: 'defra_preapprequired',
    CompletedId: 'defra_preapprequired_completed'
  },
  SAVE_AND_RETURN_EMAIL: {
    RuleSetId: 'defra_setupsaveandreturnrequired',
    CompletedId: 'defra_setupsaveandreturn_completed'
  },
  SHOW_COST_AND_TIME: {
    RuleSetId: 'defra_showcostandtime',
    CompletedId: 'defra_showcostandtime_completed'
  },
  SITE_NAME_LOCATION: {
    RuleSetId: 'defra_locationrequired',
    CompletedId: 'defra_locationrequired_completed'
  },
  SITE_PLAN: {
    RuleSetId: 'defra_siteplanrequired',
    CompletedId: 'defra_siteplanrequired_completed'
  },
  STACK_HEIGHT: {
    RuleSetId: 'defra_stackheightreq',
    CompletedId: 'defra_stackheightreq_completed'
  },
  SURFACE_DRAINAGE: {
    RuleSetId: 'defra_surfacedrainagereq',
    CompletedId: 'defra_surfacedrainagereq_completed'
  },
  TECHNICAL_QUALIFICATION: {
    RuleSetId: 'defra_techcompetenceevreq',
    CompletedId: 'defra_techcompetenceevreq_completed'
  },
  WASTE_RECOVERY_PLAN: {
    RuleSetId: 'defra_wasterecoveryplanreq',
    CompletedId: 'defra_wasterecoveryplanreq_completed'
  }
}

class ApplicationLine extends BaseModel {
  static get entity () {
    return 'defra_applicationlines'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_applicationlineid', readOnly: true},
      {field: 'applicationId', dynamics: '_defra_applicationid_value', bind: {id: 'defra_applicationId', entity: 'defra_applications'}},
      {field: 'standardRuleId', dynamics: '_defra_standardruleid_value', bind: {id: 'defra_standardruleId', entity: 'defra_standardrules'}},
      {field: 'parametersId', dynamics: '_defra_parametersid_value', readOnly: true},
      {field: 'value', dynamics: 'defra_value', readOnly: true},
      {field: 'permitType', dynamics: 'defra_permittype', constant: PermitTypes.STANDARD}
    ]
  }

  static get RulesetIds () {
    const ruleSetIds = {}
    Object.entries(RuleSet).forEach(([prop, {RuleSetId}]) => {
      ruleSetIds[prop] = RuleSetId
    })
    return ruleSetIds
  }

  static get CompletedParameters () {
    const completedParameters = {}
    Object.entries(RuleSet).forEach(([prop, {CompletedId}]) => {
      completedParameters[prop] = CompletedId
    })
    return completedParameters
  }

  static async getByApplicationId (context, applicationId) {
    return super.getBy(context, {applicationId})
  }

  static async getValidRulesetIds (context, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const rulesetIds = []
    Object.entries(RuleSet).map(([prop, {RuleSetId, CompletedId}]) => {
      rulesetIds.push(RuleSetId)
      rulesetIds.push(CompletedId)
    })
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${rulesetIds.join()})`)
    let validRuleIds = []
    try {
      const result = await dynamicsDal.search(query)
      if (result && result.defra_parametersId) {
        // return only those rulesetIds with a value of true
        validRuleIds = rulesetIds.filter((rulesetId) => result.defra_parametersId[rulesetId])
      }
    } catch (error) {
      LoggingService.logError(`Unable to get RulesetId list by applicationLineId: ${error}`)
      throw error
    }
    return validRuleIds
  }

  static async getCompleted (context, applicationLineId, completedId) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const query = encodeURI(`defra_applicationlines(${applicationLineId})?$expand=defra_parametersId($select=${completedId})`)
    let completed
    try {
      const result = await dynamicsDal.search(query)

      if (result && result.defra_parametersId) {
        completed = result.defra_parametersId[completedId]
      }
    } catch (error) {
      LoggingService.logError(`Unable to get completed by ${completedId}: ${error}`)
      throw error
    }
    return completed
  }

  async save (context) {
    const dataObject = this.modelToDynamics()
    await super.save(context, dataObject)
  }
}

ApplicationLine.setDefinitions()

module.exports = ApplicationLine
