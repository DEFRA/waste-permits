'use strict'

const Constants = require('../constants')

module.exports = {
  'SR2015 No 18': [{
    sectionIndex: 1,
    sectionName: 'Before you apply',
    listItems: [{
      id: 'check-permit-cost-and-time',
      label: Constants.Routes.COST_TIME.taskListHeading,
      href: Constants.Routes.COST_TIME.path,
      completedLabelId: 'cost-and-time-completed',
      complete: true
    }, {
      id: 'confirm-that-your-operation-meets-the-rules',
      label: Constants.Routes.CONFIRM_RULES.taskListHeading,
      href: Constants.Routes.CONFIRM_RULES.path,
      completedLabelId: 'operation-rules-completed',
      complete: true
    }]
  }, {
    sectionIndex: 2,
    sectionName: 'Prepare to apply',
    listItems: [{
      id: 'tell-us-if-youve-discussed-this-application-with-us',
      label: Constants.Routes.PRE_APPLICATION.taskListHeading,
      href: Constants.Routes.PRE_APPLICATION.path,
      completedLabelId: 'preapp-completed',
      complete: true
    }]
  }, {
    sectionIndex: 3,
    sectionName: 'Complete application',
    listItems: [{
      id: 'give-contact-details',
      label: Constants.Routes.CONTACT_DETAILS.taskListHeading,
      href: Constants.Routes.CONTACT_DETAILS.path,
      completedLabelId: 'contact-details-completed',
      complete: true
    }, {
      id: 'give-permit-holder-details',
      label: Constants.Routes.PERMIT_HOLDER_TYPE.taskListHeading,
      href: Constants.Routes.PERMIT_HOLDER_TYPE.path,
      completedLabelId: 'site-operator-completed',
      complete: true
    }, {
      id: 'give-site-name-and-location',
      label: Constants.Routes.SITE_SITE_NAME.taskListHeading,
      href: Constants.Routes.SITE_SITE_NAME.path,
      completedLabelId: 'site-name-completed',
      complete: true
    }, {
      id: 'upload-the-site-plan',
      label: Constants.Routes.SITE_PLAN.taskListHeading,
      href: Constants.Routes.SITE_PLAN.path,
      completedLabelId: 'site-plan-completed',
      complete: true
    }, {
      id: 'upload-technical-management-qualifications',
      label: Constants.Routes.TECHNICAL_QUALIFICATION.taskListHeading,
      href: Constants.Routes.TECHNICAL_QUALIFICATION.path,
      completedLabelId: 'industry-scheme-completed',
      complete: false
    }, {
      id: 'tell-us-which-management-system-you-use',
      label: Constants.Routes.MANAGEMENT_SYSTEM.taskListHeading,
      href: Constants.Routes.MANAGEMENT_SYSTEM.path,
      completedLabelId: 'management-system-completed',
      complete: true
    }, {
      id: 'upload-the-fire-prevention-plan',
      label: Constants.Routes.FIRE_PREVENTION_PLAN.taskListHeading,
      href: Constants.Routes.FIRE_PREVENTION_PLAN.path,
      completedLabelId: 'firepp-completed',
      complete: true
    }, {
      id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
      label: Constants.Routes.DRAINAGE_TYPE_DRAIN.taskListHeading,
      href: Constants.Routes.DRAINAGE_TYPE_DRAIN.path,
      completedLabelId: 'confirm-drainage-completed',
      complete: false
    }, {
      id: 'confirm-confidentiality-needs',
      label: Constants.Routes.CONFIDENTIALITY.taskListHeading,
      href: Constants.Routes.CONFIDENTIALITY.path,
      completedLabelId: 'confidentiality-completed',
      complete: false
    }]
  }, {
    sectionIndex: 4,
    sectionName: 'Send and pay',
    listItems: [{
      id: 'submit-pay',
      label: Constants.Routes.CHECK_BEFORE_SENDING.taskListHeading,
      href: Constants.Routes.CHECK_BEFORE_SENDING.path,
      completedLabelId: 'submit-and-pay',
      complete: false
    }]
  }]
}
