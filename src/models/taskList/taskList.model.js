'use strict'

const Constants = require('../../constants')

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')

// Task List related models used to check for application completeness
const CompanyDetails = require('./companyDetails.model')
const Confidentiality = require('./confidentiality.model')
const ConfirmRules = require('../../controllers/confirmRules.controller')
const ContactDetails = require('./siteNameAndLocation.model')
const FirePreventionPlan = require('./firePreventionPlan.model')
const InvoiceAddress = require('./invoiceAddress.model')
const SiteNameAndLocation = require('./siteNameAndLocation.model')
const SitePlan = require('./sitePlan.model')
const TechnicalQualification = require('./technicalQualification.model')

module.exports = class TaskList extends BaseModel {
  static async getByApplicationLineId (authToken, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    const taskList = new TaskList()
    taskList._defineTaskListSections()

    const query = encodeURI(`defra_applicationlines(${applicationLineId})?` +
      `$expand=defra_parametersId($select=${taskList._getRulesetIds()})`)

    try {
      const response = await dynamicsDal.search(query)

      taskList._setRulesetAvailabilityAndCompleteness(response.defra_parametersId)
    } catch (error) {
      LoggingService.logError(`Unable to get Task List by applicationLineId: ${error}`)
      throw error
    }

    return taskList
  }

  _defineTaskListSections () {
    this.sections = []

    const prepareApplicationSection = {
      id: 'prepare-application-section',
      sectionNumber: 1,
      sectionName: Constants.TaskList.SectionHeadings.PREPARE_APPLICATION,
      sectionItems: [{
        id: 'check-permit-cost-and-time',
        label: Constants.Routes.COST_TIME.taskListHeading,
        href: Constants.Routes.COST_TIME.path,
        completedLabelId: 'cost-and-time-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SHOW_COST_AND_TIME,
        completedId: Constants.Dynamics.CompletedParamters.SHOW_COST_AND_TIME,
        available: false
      }, {
        id: 'confirm-that-your-operation-meets-the-rules',
        label: Constants.Routes.CONFIRM_RULES.taskListHeading,
        href: Constants.Routes.CONFIRM_RULES.path,
        completedLabelId: 'operation-rules-completed',
        rulesetId: Constants.Dynamics.RulesetIds.CONFIRM_RULES,
        completedId: Constants.Dynamics.CompletedParamters.CONFIRM_RULES,
        available: false
      }, {
        id: 'waste-recovery-plan',
        label: Constants.Routes.WASTE_RECOVERY_PLAN.taskListHeading,
        href: Constants.Routes.WASTE_RECOVERY_PLAN.path,
        completedLabelId: 'waste-recovery-plan-completed',
        rulesetId: Constants.Dynamics.RulesetIds.WASTE_RECOVERY_PLAN,
        completedId: Constants.Dynamics.CompletedParamters.WASTE_RECOVERY_PLAN,
        available: false
      }, {
        id: 'tell-us-if-youve-discussed-this-application-with-us',
        label: Constants.Routes.PRE_APPLICATION.taskListHeading,
        href: Constants.Routes.PRE_APPLICATION.path,
        completedLabelId: 'preapp-completed',
        rulesetId: Constants.Dynamics.RulesetIds.PRE_APPLICATION,
        completedId: Constants.Dynamics.CompletedParamters.PRE_APPLICATION,
        available: false
      }, {
        id: 'give-contact-details',
        label: Constants.Routes.CONTACT_DETAILS.taskListHeading,
        href: Constants.Routes.CONTACT_DETAILS.path,
        completedLabelId: 'contact-details-completed',
        rulesetId: Constants.Dynamics.RulesetIds.CONTACT_DETAILS,
        completedId: Constants.Dynamics.CompletedParamters.CONTACT_DETAILS,
        available: false
      }, {
        id: 'give-permit-holder-details',
        label: Constants.Routes.PERMIT_HOLDER_TYPE.taskListHeading,
        // For MVP the route for this task list item is different,
        // we will go straight to the Company Details pathway instead.
        href: Constants.Routes.COMPANY_NUMBER.path,
        // href: Constants.Routes.PERMIT_HOLDER_TYPE.path,
        completedLabelId: 'site-operator-completed',
        rulesetId: Constants.Dynamics.RulesetIds.PERMIT_HOLDER_DETAILS,
        completedId: Constants.Dynamics.CompletedParamters.PERMIT_HOLDER_DETAILS,
        available: false
      }, {
        id: 'give-site-name-and-location',
        label: Constants.Routes.SITE_NAME.taskListHeading,
        href: Constants.Routes.SITE_NAME.path,
        completedLabelId: 'site-name-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SITE_NAME_LOCATION,
        completedId: Constants.Dynamics.CompletedParamters.SITE_NAME_LOCATION,
        available: false
      }, {
        id: 'upload-the-site-plan',
        label: Constants.Routes.SITE_PLAN.taskListHeading,
        href: Constants.Routes.SITE_PLAN.path,
        completedLabelId: 'site-plan-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SITE_PLAN,
        completedId: Constants.Dynamics.CompletedParamters.SITE_PLAN,
        available: false
      }, {
        id: 'upload-technical-management-qualifications',
        label: Constants.Routes.TECHNICAL_QUALIFICATION.taskListHeading,
        href: Constants.Routes.TECHNICAL_QUALIFICATION.path,
        completedLabelId: 'upload-completed',
        rulesetId: Constants.Dynamics.RulesetIds.TECHNICAL_QUALIFICATION,
        completedId: Constants.Dynamics.CompletedParamters.TECHNICAL_QUALIFICATION,
        available: false
      }, {
        id: 'tell-us-which-management-system-you-use',
        label: Constants.Routes.MANAGEMENT_SYSTEM.taskListHeading,
        href: Constants.Routes.MANAGEMENT_SYSTEM.path,
        completedLabelId: 'management-system-completed',
        rulesetId: Constants.Dynamics.RulesetIds.MANAGEMENT_SYSTEM,
        completedId: Constants.Dynamics.CompletedParamters.MANAGEMENT_SYSTEM,
        available: false
      }, {
        id: 'upload-the-fire-prevention-plan',
        label: Constants.Routes.FIRE_PREVENTION_PLAN.taskListHeading,
        href: Constants.Routes.FIRE_PREVENTION_PLAN.path,
        completedLabelId: 'firepp-completed',
        rulesetId: Constants.Dynamics.RulesetIds.FIRE_PREVENTION_PLAN,
        completedId: Constants.Dynamics.CompletedParamters.FIRE_PREVENTION_PLAN,
        available: true
      }, {
        id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
        label: Constants.Routes.DRAINAGE_TYPE_DRAIN.taskListHeading,
        href: Constants.Routes.DRAINAGE_TYPE_DRAIN.path,
        completedLabelId: 'confirm-drainage-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SURFACE_DRAINAGE,
        completedId: Constants.Dynamics.CompletedParamters.SURFACE_DRAINAGE,
        available: false
      }, {
        id: 'confirm-confidentiality-needs',
        label: Constants.Routes.CONFIDENTIALITY.taskListHeading,
        href: Constants.Routes.CONFIDENTIALITY.path,
        completedLabelId: 'confidentiality-completed',
        rulesetId: Constants.Dynamics.RulesetIds.CONFIRM_CONFIDENTIALLY,
        completedId: Constants.Dynamics.CompletedParamters.CONFIRM_CONFIDENTIALLY,
        available: false
      }, {
        id: 'invoicing-details',
        label: Constants.Routes.ADDRESS.POSTCODE_INVOICE.taskListHeading,
        href: Constants.Routes.ADDRESS.POSTCODE_INVOICE.path,
        completedLabelId: 'invoicing-details-completed',
        rulesetId: Constants.Dynamics.RulesetIds.INVOICING_DETAILS,
        completedId: Constants.Dynamics.CompletedParamters.INVOICING_DETAILS,
        available: false
      }]
    }

    const sendAndPaySection = {
      id: 'send-and-pay-section',
      sectionNumber: 2,
      sectionName: Constants.TaskList.SectionHeadings.APPLY,
      sectionItems: [{
        id: 'submit-pay',
        label: Constants.Routes.CHECK_BEFORE_SENDING.taskListHeading,
        href: Constants.Routes.CHECK_BEFORE_SENDING.path,
        completedLabelId: 'submit-and-pay',
        // No ruleset ID - this item is Always present and not currently stored in Dynamics
        available: true
      }]
    }

    this.sections.push(prepareApplicationSection)
    this.sections.push(sendAndPaySection)
  }

  _getRulesetIds () {
    // Iterate through the task list section items and pull out all the rulesetIds to query Dynamics for
    // (including their corresponding '_completed' suffixed items)
    const rulesetIds = []
    this.sections.forEach((section) => {
      section.sectionItems.forEach((sectionItem) => {
        if (sectionItem.rulesetId !== undefined) {
          rulesetIds.push(sectionItem.rulesetId)
          rulesetIds.push(`${sectionItem.completedId}`)
        }
      })
    })
    return rulesetIds.join()
  }

  _setRulesetAvailabilityAndCompleteness (rulesets) {
    // Iterate through the task list section items
    this.sections.forEach((section) => {
      section.sectionItems.forEach((sectionItem) => {
        // Set availability
        sectionItem.available = rulesets[sectionItem.rulesetId]

        // Set completeness
        sectionItem.complete = rulesets[sectionItem.completedId]
      })
    })

    // Set the final item (Send application and pay) to be always available
    // Since this is always available this is currently not obtained from Dynamics
    const finalSection = this.sections[this.sections.length - 1]
    const finalItem = finalSection.sectionItems[finalSection.sectionItems.length - 1]
    finalItem.available = true
  }

  static async isComplete (authToken, applicationId, applicationLineId) {
    return Promise.all([
      CompanyDetails.isComplete(authToken, applicationId),
      Confidentiality.isComplete(authToken, applicationId),
      ConfirmRules.isComplete(authToken, applicationId, applicationLineId),
      ContactDetails.isComplete(authToken, applicationId, applicationLineId),
      FirePreventionPlan.isComplete(authToken, applicationId),
      InvoiceAddress.isComplete(authToken, applicationId, applicationLineId),
      SiteNameAndLocation.isComplete(authToken, applicationId, applicationLineId),
      SitePlan.isComplete(authToken, applicationId),
      TechnicalQualification.isComplete(authToken, applicationId)
    ]).then((values) => {
      return values.reduce((isComplete, value) => isComplete && value)
    }).catch((err) => {
      console.error('Error calculating completeness:', err.message)
      throw err
    })
  }
}
