'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const ApplicationReturn = require('./applicationReturn.model')
const LoggingService = require('../services/logging.service')

const {SAVE_AND_RETURN_RECOVER} = require('../routes')
const {DIGITAL_SOURCE, PERMIT_HOLDER_TYPES, StatusCode, WASTE_REGIME} = require('../dynamics')

class Application extends BaseModel {
  static get entity () {
    return 'defra_applications'
  }

  static get mapping () {
    return [
      {field: 'id', dynamics: 'defra_applicationid', readOnly: true},
      {field: 'agentId', dynamics: '_defra_agentid_value', bind: {id: 'defra_agentid_account', relationship: 'defra_account_defra_application_agentid', entity: 'accounts'}},
      {field: 'applicantType', dynamics: 'defra_applicant_type'},
      {field: 'organisationType', dynamics: 'defra_applicant_organisation_type'},
      {field: 'applicationNumber', dynamics: 'defra_applicationnumber', readOnly: true},
      {field: 'bankruptcy', dynamics: 'defra_bankruptcydeclaration'},
      {field: 'bankruptcyDetails', dynamics: 'defra_bankruptcydeclarationdetails', length: {max: 2000}},
      {field: 'confidentiality', dynamics: 'defra_confidentialitydeclaration'},
      {field: 'confidentialityDetails', dynamics: 'defra_confidentialitydeclarationdetails', length: {max: 2000}},
      {field: 'contactId', dynamics: '_defra_primarycontactid_value', bind: {id: 'defra_primarycontactid', relationship: 'defra_contact_defra_application_primarycontactid', entity: 'contacts'}},
      {field: 'declaration', dynamics: 'defra_applicationdeclaration'},
      {field: 'drainageType', dynamics: 'defra_drainagetype'},
      {field: 'paymentReceived', dynamics: 'defra_paymentreceived'},
      {field: 'permitHolderOrganisationId', dynamics: '_defra_customerid_value', bind: {id: 'defra_customerid_account', relationship: 'defra_account_defra_application_customerid', entity: 'accounts'}},
      {field: 'permitHolderIndividualId', dynamics: '_defra_customerid_value', bind: {id: 'defra_customerid_contact', relationship: 'defra_contact_defra_application_customerid', entity: 'contacts'}},
      {field: 'regime', dynamics: 'defra_regime', constant: WASTE_REGIME},
      {field: 'relevantOffences', dynamics: 'defra_convictionsdeclaration'},
      {field: 'relevantOffencesDetails', dynamics: 'defra_convictionsdeclarationdetails', length: {max: 2000}},
      {field: 'recoveryPlanAssessmentStatus', dynamics: 'defra_plan_assessment_status'},
      {field: 'source', dynamics: 'defra_source', constant: DIGITAL_SOURCE},
      {field: 'statusCode', dynamics: 'statuscode'},
      {field: 'submittedOn', dynamics: 'defra_submittedon', isDate: true},
      {field: 'technicalQualification', dynamics: 'defra_technicalability'},
      {field: 'tradingName', dynamics: 'defra_tradingname', length: {max: 170}},
      {field: 'useTradingName', dynamics: 'defra_tradingnameused'},
      {field: 'saveAndReturnEmail', dynamics: 'defra_saveandreturnemail', length: {max: 100}, encode: true}
    ]
  }

  constructor (...args) {
    super(...args)
    const declaration = {args}
    this.declaration = Boolean(declaration)
  }

  isSubmitted () {
    return this.statusCode && (this.statusCode === StatusCode.APPLICATION_RECEIVED)
  }

  isPaid () {
    return Boolean(this.paymentReceived)
  }

  get isIndividual () {
    return this.applicantType === PERMIT_HOLDER_TYPES.INDIVIDUAL.dynamicsApplicantTypeId || this.organisationType === PERMIT_HOLDER_TYPES.SOLE_TRADER.dynamicsOrganisationTypeId
  }

  individualPermitHolderId () {
    return this.isIndividual ? this.permitHolderIndividualId : undefined
  }

  modelToDynamics (...args) {
    if (this.isIndividual && this.permitHolderOrganisationId) {
      throw new Error('Application cannot have a permitHolderOrganisationId when the permit holder is an individual')
    }
    if (!this.isIndividual && this.permitHolderIndividualId) {
      throw new Error('Application cannot have a permitHolderIndividualId when the permit holder is a company')
    }
    return super.modelToDynamics(...args)
  }

  static dynamicsToModel (...args) {
    const model = super.dynamicsToModel(...args)
    if (model.isIndividual) {
      model.permitHolderOrganisationId = undefined
    } else {
      model.permitHolderIndividualId = undefined
    }
    return model
  }

  static async listBySaveAndReturnEmail (context, saveAndReturnEmail) {
    return super.listBy(context, {saveAndReturnEmail})
  }

  async sendSaveAndReturnEmail (context, origin) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    const actionDataObject = {
      saveAndReturnUrl: `${origin}${SAVE_AND_RETURN_RECOVER.path}`
    }
    try {
      // Call Dynamics save and return email action
      let action = `${this.constructor.entity}(${this.id})/Microsoft.Dynamics.CRM.defra_saveandreturnemail`
      await dynamicsDal.callAction(action, actionDataObject)
      const applicationReturn = await ApplicationReturn.getByApplicationId(context, this.id)
      LoggingService.logDebug(`Save and Return Url for Application "${this.applicationNumber}": ${origin}${SAVE_AND_RETURN_RECOVER.path}/${applicationReturn.slug}`)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics Save and Return Email action: ${error}`)
      throw error
    }
  }

  async save (context) {
    const dataObject = this.modelToDynamics()
    const isNew = this.isNew()
    await super.save(context, dataObject)
    if (isNew) {
      LoggingService.logInfo(`Created application with ID: ${this.id}`)
    }
  }

  static async sendAllRecoveryEmails (context, origin, saveAndReturnEmail) {
    const applicationList = await this.listBySaveAndReturnEmail(context, saveAndReturnEmail)
    if (Array.isArray(applicationList)) {
      await Promise.all(applicationList.map((application) => application.sendSaveAndReturnEmail(context, origin)))
      return applicationList.length
    }
    return 0
  }
}

Application.setDefinitions()

module.exports = Application
