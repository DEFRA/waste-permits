const Routes = require('./routes')

const tasks = {
  BASELINE_REPORT: {
    id: 'baseline-report',
    ruleSetId: 'defra_baselinereportreq'
  },
  BASIC_OPERATION_DETAILS: {
    id: 'basic-operation-details',
    label: 'Give basic details about the operation',
    shortName: 'basicdetails'
  },
  BATTERY_PROCESSING: {
    id: 'battery-processing',
    label: 'Battery processing',
    shortName: 'battery'
  },
  CLINICAL_WASTE_TEMPLATE: {
    id: 'clinical-waste-template',
    label: 'Complete and upload the clinical waste template and supporting documents',
    shortName: 'clinical'
  },
  CONFIRM_CONFIDENTIALLY: {
    id: 'confirm-confidentiality-needs',
    label: 'Confirm confidentiality needs',
    route: Routes.CONFIDENTIALITY,
    completedLabelId: 'confidentiality-completed',
    ruleSetId: 'defra_cnfconfidentialityreq',
    shortName: 'confidentiality',
    taskListModel: 'confidentiality'
  },
  CONFIRM_RULES: {
    id: 'confirm-that-your-operation-meets-the-rules',
    label: 'Confirm you can meet the rules',
    route: Routes.CONFIRM_RULES,
    completedLabelId: 'operation-rules-completed',
    ruleSetId: 'defra_confirmreadrules',
    taskListModel: 'confirmRules'
  },
  CONTACT_DETAILS: {
    id: 'give-contact-details',
    label: 'Give contact details',
    route: Routes.CONTACT_DETAILS,
    completedLabelId: 'contact-details-completed',
    ruleSetId: 'defra_contactdetailsrequired',
    shortName: 'contact',
    taskListModel: 'contactDetails'
  },
  EMISSIONS_AND_MONITORING: {
    id: 'emissions-and-monitoring',
    label: 'Tell us about emissions and monitoring',
    shortName: 'emissionsmonitoring'
  },
  EMISSIONS_MANAGEMENT_PLAN: {
    id: 'emissions-management-plan',
    label: 'Upload the emissions management plan',
    shortName: 'emissionsplan'
  },
  ENVIRONMENTAL_RISK_ASSESSMENT: {
    id: 'environmental-risk-assessment',
    label: 'Upload the environmental risk assessment',
    route: Routes.ENVIRONMENTAL_RISK_ASSESSMENT,
    completedLabelId: 'environmental-risk-assessment-completed',
    shortName: 'envrisk',
    taskListModel: 'environmentalRiskAssessment'
  },
  FIRE_PREVENTION_PLAN: {
    id: 'upload-the-fire-prevention-plan',
    label: 'Upload the fire prevention plan',
    route: Routes.FIRE_PREVENTION_PLAN,
    completedLabelId: 'firepp-completed',
    ruleSetId: 'defra_fireplanrequired',
    shortName: 'fireplan',
    taskListModel: 'firePreventionPlan'
  },
  HABITATS_ASSESSMENT: {
    id: 'habitats-assessment',
    label: 'Habitats assessment',
    shortName: 'habitats'
  },
  HAZARDOUS_WASTE_TEMPLATE: {
    id: 'hazardous-waste-template',
    label: 'Complete and upload the hazardous waste template and supporting documents',
    shortName: 'hazwaste'
  },
  INVOICING_DETAILS: {
    id: 'invoicing-details',
    label: 'Give invoicing details',
    route: Routes.POSTCODE_INVOICE,
    completedLabelId: 'invoicing-details-completed',
    ruleSetId: 'defra_invoicingdetailsrequired',
    shortName: 'invoicing',
    taskListModel: 'invoiceAddress'
  },
  MINING_DATA: {
    id: 'confirm-mining-data',
    label: 'Confirm mining waste plan and weight of waste',
    route: Routes.CONFIRM_MINING_WASTE_PLAN,
    completedLabelId: 'mining-data-completed',
    ruleSetId: 'defra_miningdatarequired',
    taskListModel: 'miningWasteDetails'
  },
  MANAGEMENT_SYSTEM: {
    id: 'tell-us-which-management-system-you-use',
    label: 'Tell us which management system you use',
    route: Routes.MANAGEMENT_SYSTEM,
    completedLabelId: 'management-system-completed',
    ruleSetId: 'defra_mansystemrequired'
  },
  MANAGEMENT_SYSTEM_SUMMARY: {
    id: 'management-system-summary',
    label: 'Provide a management system summary',
    shortName: 'mansys'
  },
  MINING_WASTE_MANAGEMENT_PLAN: {
    id: 'mining-waste-management-plan',
    ruleSetId: 'defra_miningwastemanplanreq'
  },
  NEED_TO_CONSULT: {
    id: 'need-to-consult',
    label: 'Tell us who we need to consult',
    shortName: 'consult'
  },
  NHS_SCREENING: {
    id: 'nhs-screening',
    ruleSetId: 'defra_nhscreeningrequired'
  },
  NOISE_MANAGEMENT_PLAN: {
    id: 'noise-management-plan',
    label: 'Upload the noise and vibration management plan',
    shortName: 'noiseplan'
  },
  NON_TECHNICAL_SUMMARY: {
    id: 'non-technical-summary',
    label: 'Upload a non-technical summary',
    route: Routes.NON_TECHNICAL_SUMMARY,
    completedLabelId: 'non-technical-summary-completed',
    shortName: 'nontechnical',
    taskListModel: 'nonTechnicalSummary'
  },
  ODOUR_MANAGEMENT_PLAN: {
    id: 'odour-management-plan',
    label: 'Upload the odour management plan',
    shortName: 'odourplan'
  },
  PERMIT_HOLDER_DETAILS: {
    id: 'give-permit-holder-details',
    label: 'Give permit holder details',
    route: Routes.PERMIT_HOLDER_DETAILS,
    completedLabelId: 'site-operator-completed',
    ruleSetId: 'defra_pholderdetailsrequired',
    shortName: 'permitholder',
    taskListModel: 'permitHolderDetails'
  },
  PRE_APPLICATION: {
    id: 'tell-us-if-youve-discussed-this-application-with-us',
    label: 'Tell us if you have discussed this application with us',
    route: Routes.PRE_APPLICATION,
    completedLabelId: 'preapp-completed',
    ruleSetId: 'defra_preapprequired',
    shortName: 'preapp'
  },
  RECOVERY_AND_DISPOSAL_CODES: {
    id: 'recovery-and-disposal-codes',
    label: 'List the recovery and disposal codes for your activities',
    shortName: 'rdcode'
  },
  SAVE_AND_RETURN_EMAIL: {
    id: 'set-up-save-and-return',
    label: 'Save your application',
    route: Routes.SAVE_AND_RETURN_EMAIL,
    completedLabelId: 'set-up-save-and-return-completed',
    ruleSetId: 'defra_setupsaveandreturnrequired',
    shortName: 'save',
    taskListModel: 'saveAndReturn'
  },
  SHIP_BREAKING: {
    id: 'ship-breaking',
    label: 'Ship breaking',
    shortName: 'ships'
  },
  SHOW_COST_AND_TIME: {
    id: 'check-permit-cost-and-time',
    label: 'Check costs and processing time',
    route: Routes.COST_TIME,
    completedLabelId: 'cost-and-time-completed',
    ruleSetId: 'defra_showcostandtime',
    taskListModel: 'costTime'
  },
  SITE_CONDITION_REPORT: {
    id: 'site-condition-report',
    label: 'Upload the site condition report',
    shortName: 'sitecondition'
  },
  SITE_NAME_LOCATION: {
    id: 'give-site-name-and-location',
    label: 'Give site name and location',
    route: Routes.SITE_NAME,
    completedLabelId: 'site-name-completed',
    ruleSetId: 'defra_locationrequired',
    shortName: 'sitename',
    taskListModel: 'siteNameAndLocation'
  },
  SITE_PLAN: {
    id: 'upload-the-site-plan',
    label: 'Upload the site plan',
    route: Routes.SITE_PLAN,
    completedLabelId: 'site-plan-completed',
    ruleSetId: 'defra_siteplanrequired',
    shortName: 'siteplan',
    taskListModel: 'sitePlan'
  },
  STACK_HEIGHT: {
    id: 'stack-height',
    ruleSetId: 'defra_stackheightreq'
  },
  SUBMIT_PAY: {
    id: 'submit-pay',
    label: 'Send application and pay',
    route: Routes.CHECK_BEFORE_SENDING,
    completedLabelId: 'submit-and-pay',
    shortName: 'sendpay',
    required: true
  },
  SURFACE_DRAINAGE: {
    id: 'confirm-the-drainage-system-for-the-vehicle-storage-area',
    label: 'Confirm you have a suitable vehicle storage area',
    route: Routes.DRAINAGE_TYPE_DRAIN,
    completedLabelId: 'confirm-drainage-completed',
    ruleSetId: 'defra_surfacedrainagereq',
    taskListModel: 'drainageTypeDrain'
  },
  TECHNICAL_QUALIFICATION: {
    id: 'upload-technical-management-qualifications',
    label: 'Prove technical competence',
    route: Routes.TECHNICAL_QUALIFICATION,
    completedLabelId: 'upload-completed',
    ruleSetId: 'defra_techcompetenceevreq',
    shortName: 'techcomp',
    taskListModel: 'technicalQualification'
  },
  TECHNICAL_STANDARDS: {
    id: 'technical-standards',
    label: 'List the technical standards you use',
    shortName: 'techstandards'
  },
  WASTE_RECOVERY_PLAN: {
    id: 'waste-recovery-plan',
    label: 'Upload the waste recovery plan',
    route: Routes.WASTE_RECOVERY_PLAN_APPROVAL,
    completedLabelId: 'waste-recovery-plan-completed',
    ruleSetId: 'defra_wasterecoveryplanreq',
    shortName: 'wrp',
    taskListModel: 'wasteRecoveryPlan'
  },
  WASTE_TYPES_LIST: {
    id: 'upload-waste-types-list',
    label: 'List the types of waste you want to accept',
    route: Routes.WASTE_TYPES_LIST,
    completedLabelId: 'waste-types-list-completed',
    shortName: 'ewc',
    taskListModel: 'wasteTypesList'
  },
  WASTE_WEIGHT: {
    id: 'waste-weight',
    ruleSetId: 'defra_extwasteweightreq'
  }
}

const standardRules = [
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
      tasks.MINING_DATA,
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

const bespoke = [
  {
    id: 'get-a-save-link-section',
    label: 'Get a save link',
    tasks: [
      tasks.SAVE_AND_RETURN_EMAIL
    ]
  },
  {
    id: 'about-the-application-section',
    label: 'About the application',
    tasks: [
      tasks.PRE_APPLICATION,
      tasks.PERMIT_HOLDER_DETAILS,
      tasks.CONFIRM_CONFIDENTIALLY,
      tasks.INVOICING_DETAILS,
      tasks.NEED_TO_CONSULT
    ]
  },
  {
    id: 'operations-section',
    label: 'Operations',
    tasks: [
      tasks.BASIC_OPERATION_DETAILS,
      tasks.NON_TECHNICAL_SUMMARY,
      tasks.SITE_NAME_LOCATION,
      tasks.SITE_CONDITION_REPORT,
      tasks.SITE_PLAN
    ]
  },
  {
    id: 'activities-section',
    label: 'Activities',
    tasks: [
      tasks.RECOVERY_AND_DISPOSAL_CODES,
      tasks.WASTE_TYPES_LIST
    ]
  },
  {
    id: 'evidence-section',
    label: 'Evidence',
    tasks: [
      tasks.TECHNICAL_QUALIFICATION,
      tasks.FIRE_PREVENTION_PLAN,
      tasks.WASTE_RECOVERY_PLAN,
      tasks.ENVIRONMENTAL_RISK_ASSESSMENT,
      tasks.EMISSIONS_AND_MONITORING,
      tasks.MANAGEMENT_SYSTEM_SUMMARY,
      tasks.TECHNICAL_STANDARDS,
      tasks.CLINICAL_WASTE_TEMPLATE,
      tasks.HAZARDOUS_WASTE_TEMPLATE,
      tasks.EMISSIONS_MANAGEMENT_PLAN,
      tasks.NOISE_MANAGEMENT_PLAN,
      tasks.ODOUR_MANAGEMENT_PLAN,
      tasks.HABITATS_ASSESSMENT,
      tasks.BATTERY_PROCESSING,
      tasks.SHIP_BREAKING
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

  static get standardRules () {
    return standardRules
  }

  static get bespoke () {
    return bespoke
  }
}
