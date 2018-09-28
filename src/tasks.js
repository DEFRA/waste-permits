const Routes = require('./routes')

const tasks = {
  BASELINE_REPORT: {
    id: 'baseline-report',
    ruleSetId: 'defra_baselinereportreq',
    completedId: 'defra_baselinereportreq_completed'
  },
  CONFIRM_CONFIDENTIALLY: {
    id: 'confirm-confidentiality-needs',
    label: 'Confirm confidentiality needs',
    route: Routes.CONFIDENTIALITY,
    completedLabelId: 'confidentiality-completed',
    ruleSetId: 'defra_cnfconfidentialityreq',
    completedId: 'defra_cnfconfidentialityreq_completed',
    taskListModel: 'confidentiality'
  },
  CONFIRM_RULES: {
    id: 'confirm-that-your-operation-meets-the-rules',
    label: 'Confirm you can meet the rules',
    route: Routes.CONFIRM_RULES,
    completedLabelId: 'operation-rules-completed',
    ruleSetId: 'defra_confirmreadrules',
    completedId: 'defra_confirmreadrules_completed',
    taskListModel: 'confirmRules'
  },
  CONTACT_DETAILS: {
    id: 'give-contact-details',
    label: 'Give contact details',
    route: Routes.CONTACT_DETAILS,
    completedLabelId: 'contact-details-completed',
    ruleSetId: 'defra_contactdetailsrequired',
    completedId: 'defra_contactdetailsrequired_completed',
    taskListModel: 'contactDetails'
  },
  FIRE_PREVENTION_PLAN: {
    id: 'upload-the-fire-prevention-plan',
    label: 'Upload the fire prevention plan',
    route: Routes.FIRE_PREVENTION_PLAN,
    completedLabelId: 'firepp-completed',
    ruleSetId: 'defra_fireplanrequired',
    completedId: 'defra_fireplanrequired_completed',
    taskListModel: 'firePreventionPlan'
  },
  INVOICING_DETAILS: {
    id: 'invoicing-details',
    label: 'Give invoicing details',
    route: Routes.POSTCODE_INVOICE,
    completedLabelId: 'invoicing-details-completed',
    ruleSetId: 'defra_invoicingdetailsrequired',
    completedId: 'defra_invoicingdetails_completed',
    taskListModel: 'invoiceAddress'
  },
  MANAGEMENT_SYSTEM: {
    id: 'tell-us-which-management-system-you-use',
    label: 'Tell us which management system you use',
    route: Routes.MANAGEMENT_SYSTEM,
    completedLabelId: 'management-system-completed',
    ruleSetId: 'defra_mansystemrequired',
    completedId: 'defra_mansystemrequired_completed'
  },
  MINING_WASTE_MANAGEMENT_PLAN: {
    id: 'mining-waste-management-plan',
    ruleSetId: 'defra_miningwastemanplanreq',
    completedId: 'defra_miningwastemanplanreq_completed'
  },
  NHS_SCREENING: {
    id: 'nhs-screening',
    ruleSetId: 'defra_nhscreeningrequired',
    completedId: 'defra_nhscreeningrequired_completed'
  },
  PERMIT_HOLDER_DETAILS: {
    id: 'give-permit-holder-details',
    label: 'Give permit holder details',
    route: Routes.PERMIT_HOLDER_DETAILS,
    completedLabelId: 'site-operator-completed',
    ruleSetId: 'defra_pholderdetailsrequired',
    completedId: 'defra_pholderdetailsrequired_completed',
    taskListModel: 'permitHolderDetails'
  },
  PRE_APPLICATION: {
    id: 'tell-us-if-youve-discussed-this-application-with-us',
    label: 'Tell us if you have discussed this application with us',
    route: Routes.PRE_APPLICATION,
    completedLabelId: 'preapp-completed',
    ruleSetId: 'defra_preapprequired',
    completedId: 'defra_preapprequired_completed'
  },
  SAVE_AND_RETURN_EMAIL: {
    id: 'set-up-save-and-return',
    label: 'Save your application',
    route: Routes.SAVE_AND_RETURN_EMAIL,
    completedLabelId: 'set-up-save-and-return-completed',
    ruleSetId: 'defra_setupsaveandreturnrequired',
    completedId: 'defra_setupsaveandreturn_completed',
    taskListModel: 'saveAndReturn'
  },
  SHOW_COST_AND_TIME: {
    id: 'check-permit-cost-and-time',
    label: 'Check costs and processing time',
    route: Routes.COST_TIME,
    completedLabelId: 'cost-and-time-completed',
    ruleSetId: 'defra_showcostandtime',
    completedId: 'defra_showcostandtime_completed',
    taskListModel: 'costTime'
  },
  SITE_NAME_LOCATION: {
    id: 'give-site-name-and-location',
    label: 'Give site name and location',
    route: Routes.SITE_NAME,
    completedLabelId: 'site-name-completed',
    ruleSetId: 'defra_locationrequired',
    completedId: 'defra_locationrequired_completed',
    taskListModel: 'siteNameAndLocation'
  },
  SITE_PLAN: {
    id: 'upload-the-site-plan',
    label: 'Upload the site plan',
    route: Routes.SITE_PLAN,
    completedLabelId: 'site-plan-completed',
    ruleSetId: 'defra_siteplanrequired',
    completedId: 'defra_siteplanrequired_completed',
    taskListModel: 'sitePlan'
  },
  STACK_HEIGHT: {
    id: 'stack-height',
    ruleSetId: 'defra_stackheightreq',
    completedId: 'defra_stackheightreq_completed'
  },
  SUBMIT_PAY: {
    id: 'submit-pay',
    label: 'Send application and pay',
    route: Routes.CHECK_BEFORE_SENDING,
    completedLabelId: 'submit-and-pay',
    required: true
  },
  SURFACE_DRAINAGE: {
    id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
    label: 'Confirm you have a suitable vehicle storage area',
    route: Routes.DRAINAGE_TYPE_DRAIN,
    completedLabelId: 'confirm-drainage-completed',
    ruleSetId: 'defra_surfacedrainagereq',
    completedId: 'defra_surfacedrainagereq_completed',
    taskListModel: 'drainageTypeDrain'
  },
  TECHNICAL_QUALIFICATION: {
    id: 'upload-technical-management-qualifications',
    label: 'Prove technical competence',
    route: Routes.TECHNICAL_QUALIFICATION,
    completedLabelId: 'upload-completed',
    ruleSetId: 'defra_techcompetenceevreq',
    completedId: 'defra_techcompetenceevreq_completed',
    taskListModel: 'technicalQualification'
  },
  WASTE_RECOVERY_PLAN: {
    id: 'waste-recovery-plan',
    label: 'Upload the waste recovery plan',
    route: Routes.WASTE_RECOVERY_PLAN_APPROVAL,
    completedLabelId: 'waste-recovery-plan-completed',
    ruleSetId: 'defra_wasterecoveryplanreq',
    completedId: 'defra_wasterecoveryplanreq_completed',
    taskListModel: 'wasteRecoveryPlan'
  },
  WASTE_WEIGHT: {
    id: 'waste-weight',
    ruleSetId: 'defra_extwasteweightreq',
    completedId: 'defra_extwasteweightreq_completed'
  }
}

const sections = [
  {
    id: 'before-you-apply-section',
    label: 'Before you apply',
    tasks: [
      tasks.SHOW_COST_AND_TIME,
      tasks.CONFIRM_RULES,
      tasks.SURFACE_DRAINAGE,
      tasks.SAVE_AND_RETURN_EMAIL
    ]
  },
  {
    id: 'prepare-application-section',
    label: 'Prepare application',
    tasks: [
      tasks.WASTE_RECOVERY_PLAN,
      tasks.PRE_APPLICATION,
      tasks.CONTACT_DETAILS,
      tasks.PERMIT_HOLDER_DETAILS,
      tasks.SITE_NAME_LOCATION,
      tasks.SITE_PLAN,
      tasks.TECHNICAL_QUALIFICATION,
      tasks.MANAGEMENT_SYSTEM,
      tasks.FIRE_PREVENTION_PLAN,
      tasks.CONFIRM_CONFIDENTIALLY,
      tasks.INVOICING_DETAILS
    ]
  },
  {
    id: 'send-and-pay-section',
    label: 'Apply',
    tasks: [
      tasks.SUBMIT_PAY
    ]
  }
]

module.exports = class Tasks {
  static get tasks () {
    return tasks
  }

  static get sections () {
    return sections
  }
}
