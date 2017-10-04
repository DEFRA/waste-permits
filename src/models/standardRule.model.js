'use strict'

const Constants = require('../constants')

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class StandardRule extends BaseModel {
  constructor (dataObject = undefined) {
    super()
    if (dataObject) {
      this.name = dataObject.name
      this.limits = dataObject.limits
      this.code = dataObject.code
      this.codeForId = this.transformPermitCode(dataObject.code)

      // Create the Standard Rule permit sections
      this.sections = []

      // TODO set visibility in the HTML, unit test

      const beforeYouApplySection = {
        sectionIndex: 1,
        sectionName: 'Before you apply',
        sectionItems: [{
          id: 'check-permit-cost-and-time',
          label: Constants.Routes.COST_TIME.taskListHeading,
          href: Constants.Routes.COST_TIME.path,
          completedLabelId: 'cost-and-time-completed',
          visible: false,
          complete: false
        }, {
          id: 'confirm-that-your-operation-meets-the-rules',
          label: Constants.Routes.CONFIRM_RULES.taskListHeading,
          href: Constants.Routes.CONFIRM_RULES.path,
          completedLabelId: 'operation-rules-completed',
          visible: false,
          complete: false
        }]
      }

      const prepareToApplySection = {
        sectionIndex: 2,
        sectionName: 'Prepare to apply',
        sectionItems: [{
          id: 'tell-us-if-youve-discussed-this-application-with-us',
          label: Constants.Routes.PRE_APPLICATION.taskListHeading,
          href: Constants.Routes.PRE_APPLICATION.path,
          completedLabelId: 'preapp-completed',
          visible: false,
          complete: false
        }]
      }

      const completeApplicationSection = {
        sectionIndex: 3,
        sectionName: 'Complete application',
        sectionItems: [{
          id: 'give-contact-details',
          label: Constants.Routes.CONTACT_DETAILS.taskListHeading,
          href: Constants.Routes.CONTACT_DETAILS.path,
          completedLabelId: 'contact-details-completed',
          visible: false,
          complete: false
        }, {
          id: 'give-permit-holder-details',
          label: Constants.Routes.PERMIT_HOLDER_TYPE.taskListHeading,
          href: Constants.Routes.PERMIT_HOLDER_TYPE.path,
          completedLabelId: 'site-operator-completed',
          visible: false,
          complete: false
        }, {
          id: 'give-site-name-and-location',
          label: Constants.Routes.SITE_SITE_NAME.taskListHeading,
          href: Constants.Routes.SITE_SITE_NAME.path,
          completedLabelId: 'site-name-completed',
          visible: false,
          complete: false
        }, {
          id: 'upload-the-site-plan',
          label: Constants.Routes.SITE_PLAN.taskListHeading,
          href: Constants.Routes.SITE_PLAN.path,
          completedLabelId: 'site-plan-completed',
          visible: false,
          complete: false
        }, {
          id: 'upload-technical-management-qualifications',
          label: Constants.Routes.TECHNICAL_QUALIFICATION.taskListHeading,
          href: Constants.Routes.TECHNICAL_QUALIFICATION.path,
          completedLabelId: 'industry-scheme-completed',
          visible: false,
          complete: false
        }, {
          id: 'tell-us-which-management-system-you-use',
          label: Constants.Routes.MANAGEMENT_SYSTEM.taskListHeading,
          href: Constants.Routes.MANAGEMENT_SYSTEM.path,
          completedLabelId: 'management-system-completed',
          visible: false,
          complete: false
        }, {
          id: 'upload-the-fire-prevention-plan',
          label: Constants.Routes.FIRE_PREVENTION_PLAN.taskListHeading,
          href: Constants.Routes.FIRE_PREVENTION_PLAN.path,
          completedLabelId: 'firepp-completed',
          visible: false,
          complete: false
        }, {
          id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
          label: Constants.Routes.DRAINAGE_TYPE_DRAIN.taskListHeading,
          href: Constants.Routes.DRAINAGE_TYPE_DRAIN.path,
          completedLabelId: 'confirm-drainage-completed',
          visible: false,
          complete: false
        }, {
          id: 'confirm-confidentiality-needs',
          label: Constants.Routes.CONFIDENTIALITY.taskListHeading,
          href: Constants.Routes.CONFIDENTIALITY.path,
          completedLabelId: 'confidentiality-completed',
          visible: false,
          complete: false
        }]
      }

      const sendAndPaySection = {
        sectionIndex: 4,
        sectionName: 'Send and pay',
        sectionItems: [{
          id: 'submit-pay',
          label: Constants.Routes.CHECK_BEFORE_SENDING.taskListHeading,
          href: Constants.Routes.CHECK_BEFORE_SENDING.path,
          completedLabelId: 'submit-and-pay',
          visible: false,
          complete: false
        }]
      }

      this.sections.push(beforeYouApplySection)
      this.sections.push(prepareToApplySection)
      this.sections.push(completeApplicationSection)
      this.sections.push(sendAndPaySection)
    }
  }

  static async getByCode (authToken, code) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const query = encodeURI(`defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code&$filter=defra_code eq '${code}'&` +
      `$expand=defra_wasteparametersId(` +
      `$select=` +
      `defra_allowpermitstartdate,defra_baselinereportreq,defra_cnfconfidentialityreq,defra_confirmreadrules,defra_contactdetailsrequired,defra_extwasteweightreq,` +
      `defra_fireplanrequired,defra_locationrequired,defra_mansystemrequired,defra_miningwastemanplanreq,defra_nhscreeningrequired,defra_pholderdetailsrequired,` +
      `defra_preapprequired,defra_showcostandtime,defra_siteplanrequired,defra_stackheightreq,defra_surfacedrainagereq,defra_techcompetenceevreq,defra_wasteparamsid,` +
      `defra_wasterecoveryplanreq)`)
    try {
      const response = await dynamicsDal.search(query)

      const result = response.value[0]

      // TODO: iterate these sections and set visibility from Dynamics result
      // section items:
      // defra_allowpermitstartdate: false,
      // defra_baselinereportreq: false,
      // defra_cnfconfidentialityreq: true,
      // defra_confirmreadrules: true,
      // defra_contactdetailsrequired: true,
      // defra_extwasteweightreq: false,
      // defra_fireplanrequired: true,
      // defra_locationrequired: true,
      // defra_mansystemrequired: true,
      // defra_miningwastemanplanreq: false,
      // defra_nhscreeningrequired: true,
      // defra_pholderdetailsrequired: true,
      // defra_preapprequired: true,
      // defra_showcostandtime: true,
      // defra_siteplanrequired: true,
      // defra_stackheightreq: false,
      // defra_surfacedrainagereq: true,
      // defra_techcompetenceevreq: true,
      // defra_wasteparamsid: '52b88b78-51a8-e711-810e-5065f38adb81',
      // defra_wasterecoveryplanreq: false

      // Construct and return the permit
      return new StandardRule({
        name: result.defra_rulesnamegovuk,
        limits: result.defra_limits,
        code: result.defra_code
      })
    } catch (error) {
      LoggingService.logError(`Unable to get StandardRule by code: ${error}`)
      throw error
    }
  }

  static async list (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const filter =
      // Must be open for applications
      `defra_canapplyfor eq true` +
      // Must be SR2015 No 18 - *** this is temporary ***
      ` and defra_code eq 'SR2015 No 18'` +
      // Status code must be 1
      ` and statuscode eq 1`

    const query = encodeURI(`defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code&$filter=${filter}`)
    try {
      const response = await dynamicsDal.search(query)

      const standardRules = {
        count: 0,
        results: []
      }

      // Parse response into Contact objects
      response.value.forEach((standardRule) => {
        standardRules.results.push(new StandardRule({
          // Construct the permit
          name: standardRule.defra_rulesnamegovuk,
          limits: standardRule.defra_limits,
          code: standardRule.defra_code
        }))
        standardRules.count++
      })
      return standardRules
    } catch (error) {
      LoggingService.logError(`Unable to list StandardRules: ${error}`)
      throw error
    }
  }

  // Transform the code into kebab-case for ID
  transformPermitCode (code) {
    return code.replace(/\s+/g, '-').toLowerCase()
  }
}
