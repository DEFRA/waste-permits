'use strict'

const dynamicsDal = require('../../services/dynamicsDal.service')
const BaseEntity = require('./base.entity')
const ApplicationReturn = require('./applicationReturn.entity')
const LoggingService = require('../../services/logging.service')

const { SAVE_AND_RETURN_RECOVER } = require('../../routes')
const { DIGITAL_SOURCE, PERMIT_HOLDER_TYPES } = require('../../dynamics')

class Application extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_applications'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_applicationid', readOnly: true },
      { field: 'agentId', dynamics: '_defra_agentid_value', bind: { id: 'defra_agentid_account', relationship: 'defra_account_defra_application_agentid', dynamicsEntity: 'accounts' } },
      { field: 'applicantType', dynamics: 'defra_applicant_type' },
      { field: 'organisationType', dynamics: 'defra_applicant_organisation_type' },
      { field: 'applicationNumber', dynamics: 'defra_applicationnumber', readOnly: true },
      { field: 'bankruptcy', dynamics: 'defra_bankruptcydeclaration' },
      { field: 'bankruptcyDetails', dynamics: 'defra_bankruptcydeclarationdetails', length: { max: 2000 } },
      { field: 'confidentiality', dynamics: 'defra_confidentialitydeclaration' },
      { field: 'confidentialityDetails', dynamics: 'defra_confidentialitydeclarationdetails', length: { max: 2000 } },
      { field: 'contactId', dynamics: '_defra_primarycontactid_value', bind: { id: 'defra_primarycontactid', relationship: 'defra_contact_defra_application_primarycontactid', dynamicsEntity: 'contacts' } },
      { field: 'declaration', dynamics: 'defra_applicationdeclaration' },
      { field: 'drainageType', dynamics: 'defra_drainagetype' },
      { field: 'paymentReceived', dynamics: 'defra_paymentreceived' },
      { field: 'permitHolderOrganisationId', dynamics: '_defra_customerid_value', bind: { id: 'defra_customerid_account', relationship: 'defra_account_defra_application_customerid', dynamicsEntity: 'accounts' } },
      { field: 'permitHolderIndividualId', dynamics: '_defra_customerid_value', bind: { id: 'defra_customerid_contact', relationship: 'defra_contact_defra_application_customerid', dynamicsEntity: 'contacts' } },
      { field: 'relevantOffences', dynamics: 'defra_convictionsdeclaration' },
      { field: 'relevantOffencesDetails', dynamics: 'defra_convictionsdeclarationdetails', length: { max: 2000 } },
      { field: 'recoveryPlanAssessmentStatus', dynamics: 'defra_plan_assessment_status' },
      { field: 'source', dynamics: 'defra_source', constant: DIGITAL_SOURCE },
      { field: 'statusCode', dynamics: 'statuscode' },
      { field: 'submittedOn', dynamics: 'defra_submittedon', isDate: true },
      { field: 'technicalQualification', dynamics: 'defra_technicalability' },
      { field: 'tradingName', dynamics: 'defra_tradingname', length: { max: 170 } },
      { field: 'useTradingName', dynamics: 'defra_tradingnameused' },
      { field: 'saveAndReturnEmail', dynamics: 'defra_saveandreturnemail', length: { max: 100 }, encode: true },
      { field: 'miningWasteWeight', dynamics: 'defra_miningwasteweight', length: { max: 20 } },
      { field: 'miningWastePlan', dynamics: 'defra_miningwasteplan' },
      { field: 'lineItemsTotalAmount', dynamics: 'defra_balance_line_items', readOnly: true },
      { field: 'regime', dynamics: '_defra_regimeid_value', bind: { id: 'defra_regimeid', relationship: 'defra_regime_defra_application_regimeid', dynamicsEntity: 'defra_regimes' } },
      { field: 'businessTrack', dynamics: '_defra_businesstrackid_value', bind: { id: 'defra_businesstrackid', relationship: 'defra_businesstrack_defra_application_businesstrackid', dynamicsEntity: 'defra_businesstracks' } },
      { field: 'preApplicationReference', dynamics: 'defra_external_system_reference' }
    ]
  }

  constructor (...args) {
    super(...args)
    const declaration = { args }
    this.declaration = Boolean(declaration)
  }

  isSubmitted () {
    return Boolean(this.submittedOn)
  }

  get isIndividual () {
    return this.applicantType === PERMIT_HOLDER_TYPES.INDIVIDUAL.dynamicsApplicantTypeId ||
      this.organisationType === PERMIT_HOLDER_TYPES.SOLE_TRADER.dynamicsOrganisationTypeId
  }

  static async getById (...args) {
    const application = await super.getById(...args)

    // Make sure application and applicationId are added to the entity context
    if (application) {
      const [context] = args
      context.application = application
      context.applicationId = application.id
    }

    return application
  }

  async save (...args) {
    const [context = {}] = args
    const { charityDetail = {} } = context
    if (this.isIndividual || charityDetail.isIndividual) {
      this.permitHolderOrganisationId = undefined
      if (charityDetail.isIndividual) {
        this.applicantType = PERMIT_HOLDER_TYPES.INDIVIDUAL.dynamicsApplicantTypeId
      }
    } else {
      this.permitHolderIndividualId = undefined
    }
    return super.save(...args)
  }

  static async listBySaveAndReturnEmail (context, saveAndReturnEmail) {
    return super.listBy(context, { saveAndReturnEmail })
  }

  async sendSaveAndReturnEmail (context, origin) {
    const actionDataObject = {
      saveAndReturnUrl: `${origin}${SAVE_AND_RETURN_RECOVER.path}`
    }
    try {
      // Call Dynamics save and return email action
      const action = `${this.constructor.dynamicsEntity}(${this.id})/Microsoft.Dynamics.CRM.defra_saveandreturnemail`
      await dynamicsDal.callAction(action, actionDataObject)
      const applicationReturn = await ApplicationReturn.getByApplicationId(context, this.id)
      LoggingService.logInfo(`Save and Return Url for Application "${this.applicationNumber}": ${origin}${SAVE_AND_RETURN_RECOVER.path}/${applicationReturn.slug}`)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics Save and Return Email action: ${error}`)
      throw error
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
