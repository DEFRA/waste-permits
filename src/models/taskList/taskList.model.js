'use strict'

const Constants = require('../../constants')

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')

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

    const beforeYouApplySection = {
      id: 'before-you-apply-section',
      sectionNumber: 1,
      sectionName: Constants.TaskList.SectionHeadings.BEFORE_YOU_APPLY,
      sectionItems: [{
        id: 'check-permit-cost-and-time',
        label: Constants.Routes.COST_TIME.taskListHeading,
        href: Constants.Routes.COST_TIME.path,
        completedLabelId: 'cost-and-time-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SHOW_COST_AND_TIME,
        available: false
      }, {
        id: 'confirm-that-your-operation-meets-the-rules',
        label: Constants.Routes.CONFIRM_RULES.taskListHeading,
        href: Constants.Routes.CONFIRM_RULES.path,
        completedLabelId: 'operation-rules-completed',
        rulesetId: Constants.Dynamics.RulesetIds.CONFIRM_RULES,
        available: false
      }, {
        id: 'waste-recovery-plan',
        label: Constants.Routes.WASTE_RECOVERY_PLAN.taskListHeading,
        href: Constants.Routes.WASTE_RECOVERY_PLAN.path,
        completedLabelId: 'waste-recovery-plan-completed',
        rulesetId: Constants.Dynamics.RulesetIds.WASTE_RECOVERY_PLAN,
        available: false
      }, {
        id: 'tell-us-if-youve-discussed-this-application-with-us',
        label: Constants.Routes.PRE_APPLICATION.taskListHeading,
        href: Constants.Routes.PRE_APPLICATION.path,
        completedLabelId: 'preapp-completed',
        rulesetId: Constants.Dynamics.RulesetIds.PRE_APPLICATION,
        available: false
      }]
    }

    const completeApplicationSection = {
      id: 'complete-application-section',
      sectionNumber: 2,
      sectionName: Constants.TaskList.SectionHeadings.COMPLETE_APPLICATION,
      sectionItems: [{
        id: 'give-contact-details',
        label: Constants.Routes.CONTACT_DETAILS.taskListHeading,
        href: Constants.Routes.CONTACT_DETAILS.path,
        completedLabelId: 'contact-details-completed',
        rulesetId: Constants.Dynamics.RulesetIds.CONTACT_DETAILS,
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
        available: false
      }, {
        id: 'give-site-name-and-location',
        label: Constants.Routes.SITE_SITE_NAME.taskListHeading,
        href: Constants.Routes.SITE_SITE_NAME.path,
        completedLabelId: 'site-name-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SITE_NAME_LOCATION,
        available: false
      }, {
        id: 'upload-the-site-plan',
        label: Constants.Routes.SITE_PLAN.taskListHeading,
        href: Constants.Routes.SITE_PLAN.path,
        completedLabelId: 'site-plan-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SITE_PLAN,
        available: false
      }, {
        id: 'upload-technical-management-qualifications',
        label: Constants.Routes.TECHNICAL_QUALIFICATION.taskListHeading,
        href: Constants.Routes.TECHNICAL_QUALIFICATION.path,
        completedLabelId: 'industry-scheme-completed',
        rulesetId: Constants.Dynamics.RulesetIds.TECHNICAL_QUALIFICATION,
        available: false
      }, {
        id: 'tell-us-which-management-system-you-use',
        label: Constants.Routes.MANAGEMENT_SYSTEM.taskListHeading,
        href: Constants.Routes.MANAGEMENT_SYSTEM.path,
        completedLabelId: 'management-system-completed',
        rulesetId: Constants.Dynamics.RulesetIds.MANAGEMENT_SYSTEM,
        available: false
      }, {
        id: 'upload-the-fire-prevention-plan',
        label: Constants.Routes.FIRE_PREVENTION_PLAN.taskListHeading,
        href: Constants.Routes.FIRE_PREVENTION_PLAN.path,
        completedLabelId: 'firepp-completed',
        rulesetId: Constants.Dynamics.RulesetIds.FIRE_PREVENTION_PLAN,
        available: false
      }, {
        id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
        label: Constants.Routes.DRAINAGE_TYPE_DRAIN.taskListHeading,
        href: Constants.Routes.DRAINAGE_TYPE_DRAIN.path,
        completedLabelId: 'confirm-drainage-completed',
        rulesetId: Constants.Dynamics.RulesetIds.SURFACE_DRAINAGE,
        available: false
      }, {
        id: 'confirm-confidentiality-needs',
        label: Constants.Routes.CONFIDENTIALITY.taskListHeading,
        href: Constants.Routes.CONFIDENTIALITY.path,
        completedLabelId: 'confidentiality-completed',
        rulesetId: Constants.Dynamics.RulesetIds.CONFIRM_CONFIDENTIALLY,
        available: false
      }]
    }

    const sendAndPaySection = {
      id: 'send-and-pay-section',
      sectionNumber: 3,
      sectionName: Constants.TaskList.SectionHeadings.SEND_AND_PAY,
      sectionItems: [{
        id: 'submit-pay',
        label: Constants.Routes.CHECK_BEFORE_SENDING.taskListHeading,
        href: Constants.Routes.CHECK_BEFORE_SENDING.path,
        completedLabelId: 'submit-and-pay',
        // No ruleset ID - this item is Always present and not currently stored in Dynamics
        available: true
      }]
    }

    this.sections.push(beforeYouApplySection)
    this.sections.push(completeApplicationSection)
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
          rulesetIds.push(`${sectionItem.rulesetId}_completed`)
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
        sectionItem.complete = rulesets[sectionItem.rulesetId + '_completed']
      })
    })

    // Set the final item (Send application and pay) to be always available
    // Since this is always available this is currently not obtained from Dynamics
    const finalSection = this.sections[this.sections.length - 1]
    const finalItem = finalSection.sectionItems[finalSection.sectionItems.length - 1]
    finalItem.available = true
  }
}
