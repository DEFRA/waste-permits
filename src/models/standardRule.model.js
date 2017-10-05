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
      this.codeForId = StandardRule.transformPermitCode(dataObject.code)
    }

    // Create the Standard Rule permit sections
    this.sections = []

    const beforeYouApplySection = {
      sectionIndex: 1,
      sectionName: 'Before you apply',
      sectionItems: [{
        id: 'check-permit-cost-and-time',
        label: Constants.Routes.COST_TIME.taskListHeading,
        href: Constants.Routes.COST_TIME.path,
        completedLabelId: 'cost-and-time-completed',
        // rulesetId: Constants.RulesetIds.XXXXX,
        // TODO
        rulesetId: Constants.RulesetIds.CONFIRM_RULES,
        available: false,
        complete: false
      }, {
        id: 'confirm-that-your-operation-meets-the-rules',
        label: Constants.Routes.CONFIRM_RULES.taskListHeading,
        href: Constants.Routes.CONFIRM_RULES.path,
        completedLabelId: 'operation-rules-completed',
        rulesetId: Constants.RulesetIds.CONFIRM_RULES,
        available: false,
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
        rulesetId: Constants.RulesetIds.PRE_APPLICATION,
        available: false,
        complete: true
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
        rulesetId: Constants.RulesetIds.CONTACT_DETAILS,
        available: false,
        complete: false
      }, {
        id: 'give-permit-holder-details',
        label: Constants.Routes.PERMIT_HOLDER_TYPE.taskListHeading,
        href: Constants.Routes.PERMIT_HOLDER_TYPE.path,
        completedLabelId: 'site-operator-completed',
        rulesetId: Constants.RulesetIds.PERMIT_HOLDER_DETAILS,
        available: false,
        complete: false
      }, {
        id: 'give-site-name-and-location',
        label: Constants.Routes.SITE_SITE_NAME.taskListHeading,
        href: Constants.Routes.SITE_SITE_NAME.path,
        completedLabelId: 'site-name-completed',
        // rulesetId: Constants.RulesetIds.XXXXX,
        // TODO
        rulesetId: Constants.RulesetIds.CONFIRM_RULES,
        available: false,
        complete: false
      }, {
        id: 'upload-the-site-plan',
        label: Constants.Routes.SITE_PLAN.taskListHeading,
        href: Constants.Routes.SITE_PLAN.path,
        completedLabelId: 'site-plan-completed',
        rulesetId: Constants.RulesetIds.SITE_PLAN,
        available: false,
        complete: false
      }, {
        id: 'upload-technical-management-qualifications',
        label: Constants.Routes.TECHNICAL_QUALIFICATION.taskListHeading,
        href: Constants.Routes.TECHNICAL_QUALIFICATION.path,
        completedLabelId: 'industry-scheme-completed',
        rulesetId: Constants.RulesetIds.TECHNICAL_QUALIFICATION,
        available: false,
        complete: false
      }, {
        id: 'tell-us-which-management-system-you-use',
        label: Constants.Routes.MANAGEMENT_SYSTEM.taskListHeading,
        href: Constants.Routes.MANAGEMENT_SYSTEM.path,
        completedLabelId: 'management-system-completed',
        rulesetId: Constants.RulesetIds.MANAGEMENT_SYSTEM,
        available: false,
        complete: false
      }, {
        id: 'upload-the-fire-prevention-plan',
        label: Constants.Routes.FIRE_PREVENTION_PLAN.taskListHeading,
        href: Constants.Routes.FIRE_PREVENTION_PLAN.path,
        completedLabelId: 'firepp-completed',
        rulesetId: Constants.RulesetIds.FIRE_PREVENTION_PLAN,
        available: false,
        complete: false
      }, {
        id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
        label: Constants.Routes.DRAINAGE_TYPE_DRAIN.taskListHeading,
        href: Constants.Routes.DRAINAGE_TYPE_DRAIN.path,
        completedLabelId: 'confirm-drainage-completed',
        rulesetId: Constants.RulesetIds.SURFACE_DRAINAGE,
        available: false,
        complete: false
      }, {
        id: 'confirm-confidentiality-needs',
        label: Constants.Routes.CONFIDENTIALITY.taskListHeading,
        href: Constants.Routes.CONFIDENTIALITY.path,
        completedLabelId: 'confidentiality-completed',
        rulesetId: Constants.RulesetIds.CONFIRM_CONFIDENTIALLY,
        available: false,
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
        // rulesetId: Constants.RulesetIds.XXXXX,
        // TODO
        rulesetId: Constants.RulesetIds.CONFIRM_RULES,
        available: false,
        complete: false
      }]
    }

    this.sections.push(beforeYouApplySection)
    this.sections.push(prepareToApplySection)
    this.sections.push(completeApplicationSection)
    this.sections.push(sendAndPaySection)
  }

  getRulesetIds () {
    const rulesetIds = []
    this.sections.forEach((section) => {
      section.sectionItems.forEach((sectionItem) => {
        rulesetIds.push(sectionItem.rulesetId)
      })
    })
    return rulesetIds.join()
  }

  setRulesetAvailability (rulesets) {
    this.sections.forEach((section) => {
      section.sectionItems.forEach((sectionItem) => {
        sectionItem.available = rulesets[sectionItem.rulesetId]
      })
    })
  }

  static async getByCode (authToken, code) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const standardRule = new StandardRule()

    const filter = `defra_code eq '${code}'`

    const query = encodeURI(`defra_standardrules?$select=defra_rulesnamegovuk,defra_limits,defra_code&` +
      `$filter=${filter}&` +
      `$expand=defra_wasteparametersId($select=${standardRule.getRulesetIds()})`)
    try {
      const response = await dynamicsDal.search(query)

      const result = response.value[0]

      // Set StandardRule properties
      standardRule.name = result.defra_rulesnamegovuk
      standardRule.limits = result.defra_limits
      standardRule.code = result.defra_code
      standardRule.codeForId = StandardRule.transformPermitCode(standardRule.code)

      // Set the availability of each task list item
      standardRule.setRulesetAvailability(result.defra_wasteparametersId)
    } catch (error) {
      LoggingService.logError(`Unable to get StandardRule by code: ${error}`)
      throw error
    }

    return standardRule
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
  static transformPermitCode (code) {
    return code.replace(/\s+/g, '-').toLowerCase()
  }
}
