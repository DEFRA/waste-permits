const Routes = require('./routes')

const tasks = {
  AIR_QUALITY_MANAGEMENT_AREA: {
    id: 'air-quality-management',
    label: 'Give Air Quality Management Area details',
    route: Routes.AIR_QUALITY_MANAGEMENT_AREA,
    determinants: ['aqmaRequired'],
    completedLabelId: 'air-quality-management-completed',
    shortName: 'aqma',
    taskListModel: 'airQualityManagementArea'
  },
  AIR_DISPERSION_MODELLING_REPORT: {
    id: 'upload-air-dispersion-modelling-report',
    label: 'Upload air dispersion modelling report',
    route: Routes.AIR_DISPERSION_MODELLING_REPORT,
    determinants: ['airDispersionModellingRequired'],
    completedLabelId: 'upload-air-dispersion-modelling-report-completed',
    shortName: 'airreport',
    taskListModel: 'airDispersionModellingReport'
  },
  BASELINE_REPORT: {
    id: 'baseline-report',
    ruleSetId: 'defra_baselinereportreq'
  },
  BASIC_OPERATION_DETAILS: {
    id: 'basic-operation-details',
    label: 'Give basic details about the operation',
    completedLabelId: 'basic-operation-details-completed',
    shortName: 'basicdetails'
  },
  BATTERY_PROCESSING: {
    id: 'battery-processing',
    label: 'Battery processing',
    completedLabelId: 'battery-processing-completed',
    shortName: 'battery'
  },
  BEST_AVAILABLE_TECHNIQUES_ASSESSMENT: {
    id: 'upload-best-available-techniques-assessment',
    label: 'Upload the best available techniques assessment',
    route: Routes.BEST_AVAILABLE_TECHNIQUES_ASSESSMENT,
    determinants: ['bestAvailableTechniquesAssessment'],
    completedLabelId: 'upload-best-available-techniques-assessment-completed',
    shortName: 'batassessment',
    taskListModel: 'bestAvailableTechniquesAssessment'
  },
  CLINICAL_WASTE_APPENDIX: {
    id: 'clinical-waste-appendix',
    label: 'Tell us how you will manage clinical waste',
    route: Routes.CLINICAL_WASTE_DOCUMENTS_STORE_TREAT_WASTE_TYPE,
    completedLabelId: 'clinical-waste-appendix-completed',
    shortName: 'clinical',
    taskListModel: 'clinicalWasteAppendix'
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
    label: 'Confirm you meet the rules',
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
    route: Routes.EMISSIONS_AND_MONITORING_CHECK,
    completedLabelId: 'emissions-and-monitoring-completed',
    shortName: 'emissionsmonitoring',
    taskListModel: 'emissionsAndMonitoring'
  },
  EMISSIONS_MANAGEMENT_PLAN: {
    id: 'emissions-management-plan',
    label: 'Upload the dust and emissions management plan',
    route: Routes.EMISSIONS_MANAGEMENT_PLAN,
    determinants: ['emissionsManagementPlanRequired'],
    completedLabelId: 'emissions-management-plan-completed',
    shortName: 'emissionsplan',
    taskListModel: 'emissionsManagementPlan'
  },
  ENERGY_EFFICIENCY_REPORT: {
    id: 'upload-energy-efficiency-report',
    label: 'Upload the energy efficiency report',
    route: Routes.ENERGY_EFFICIENCY_REPORT,
    determinants: ['energyEfficiencyReportRequired'],
    completedLabelId: 'upload-energy-efficiency-report-completed',
    shortName: 'energyefficiency',
    taskListModel: 'energyEfficiencyReport'
  },
  ENVIRONMENTAL_RISK_ASSESSMENT: {
    id: 'environmental-risk-assessment',
    label: 'Upload the environmental risk assessment',
    route: Routes.ENVIRONMENTAL_RISK_ASSESSMENT,
    completedLabelId: 'environmental-risk-assessment-completed',
    shortName: 'envrisk',
    taskListModel: 'environmentalRiskAssessment'
  },
  CLIMATE_CHANGE_RISK_SCREENING: {
    id: 'climate-change-risk-screening',
    label: 'Complete the climate change risk screening',
    route: Routes.CLIMATE_CHANGE_RISK_SCREENING_PERMIT_LENGTH,
    completedLabelId: 'climate-change-risk-screening-completed',
    shortName: 'climaterisk',
    taskListModel: 'climateChangeRiskScreening'
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
    completedLabelId: 'habitats-assessment-completed',
    shortName: 'habitats'
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
  MANAGE_HAZARDOUS_WASTE: {
    id: 'hazardous-waste',
    label: 'Tell us how you will manage hazardous waste',
    route: Routes.HAZARDOUS_WASTE_TREATMENT_SUMMARY_UPLOAD,
    completedLabelId: 'hazardous-waste-completed',
    shortName: 'hazwaste',
    taskListModel: 'manageHazardousWaste'
  },
  MANAGEMENT_SYSTEM: {
    id: 'management-system',
    label: 'Provide a management system summary',
    route: Routes.MANAGEMENT_SYSTEM_SELECT,
    completedLabelId: 'management-system-completed',
    ruleSetId: 'defra_mansystemrequired',
    shortName: 'mansys',
    taskListModel: 'managementSystem'
  },
  MCP_BUSINESS_ACTIVITY: {
    id: 'mcp-business-activity',
    label: 'Choose business or activity type',
    route: Routes.MCP_BUSINESS_ACTIVITY,
    determinants: ['businessActivityRequired'],
    completedLabelId: 'business-activity-completed',
    ruleSetId: 'defra_mcp_businesstype',
    shortName: 'nacecode',
    taskListModel: 'mcpBusinessActivity'
  },
  MCP_DETAILS: {
    id: 'mcp-details',
    label: 'Upload the plant or generator list template',
    route: Routes.MCP_DETAILS,
    completedLabelId: 'mcp-details-completed',
    ruleSetId: 'defra_mcp_sr_uploadtemplate',
    shortName: 'templateupload',
    taskListModel: 'mcpDetails'
  },
  MCP_TEMPLATE: {
    id: 'mcp-template',
    label: 'Complete the plant or generator list template',
    route: Routes.MCP_TEMPLATE,
    completedLabelId: 'mcp-template-completed',
    ruleSetId: 'defra_mcp_sr_downloadtemplate',
    shortName: 'templatedownload',
    taskListModel: 'mcpTemplate'
  },
  MINING_DATA: {
    id: 'confirm-mining-data',
    label: 'Confirm mining waste plan and waste weight',
    route: Routes.CONFIRM_MINING_WASTE_PLAN,
    completedLabelId: 'mining-data-completed',
    ruleSetId: 'defra_miningdatarequired',
    taskListModel: 'miningWasteDetails'
  },
  MINING_WASTE_MANAGEMENT_PLAN: {
    id: 'mining-waste-management-plan',
    ruleSetId: 'defra_miningwastemanplanreq',
    completedLabelId: 'mining-waste-management-completed'
  },
  NEED_TO_CONSULT: {
    id: 'need-to-consult',
    label: 'Tell us who we need to consult',
    route: Routes.NEED_TO_CONSULT,
    completedLabelId: 'consult-completed',
    shortName: 'consult',
    taskListModel: 'needToConsult'
  },
  NHS_SCREENING: {
    id: 'nhs-screening',
    ruleSetId: 'defra_nhscreeningrequired',
    completedLabelId: 'nhs-screening-completed'
  },
  NOISE_VIBRATION_DOCUMENTS: {
    id: 'noise-vibration-documents',
    label: 'Upload noise and vibration emissions documents',
    route: Routes.NOISE_VIBRATION_DOCUMENTS,
    determinants: ['noiseVibrationDocumentsRequired'],
    completedLabelId: 'noise-vibration-documents-completed',
    shortName: 'noisevibrationdocs',
    taskListModel: 'noiseVibrationDocuments'
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
    route: Routes.ODOUR_MANAGEMENT_PLAN,
    determinants: ['odourManagementPlanRequired'],
    completedLabelId: 'odour-management-plan-completed',
    shortName: 'odourplan',
    taskListModel: 'odourManagementPlan'
  },
  PERMIT_HOLDER_DETAILS: {
    id: 'give-permit-holder-details',
    label: 'Give permit holder details',
    route: Routes.PERMIT_HOLDER_TYPE,
    completedLabelId: 'site-operator-completed',
    ruleSetId: 'defra_pholderdetailsrequired',
    shortName: 'permitholder',
    taskListModel: 'permitHolderDetails'
  },
  PEST_MANAGEMENT_PLAN: {
    id: 'upload-pest-management-plan',
    label: 'Upload a pest management plan',
    route: Routes.PEST_MANAGEMENT_PLAN,
    completedLabelId: 'pest-management-completed',
    shortName: 'pestmanagement',
    taskListModel: 'pestManagementPlan'
  },
  PRE_APPLICATION_REFERENCE: {
    id: 'provide-your-pre-application-reference',
    label: 'Provide your pre-application reference',
    route: Routes.PRE_APPLICATION_REFERENCE,
    determinants: ['receivedPreApplicationAdvice'],
    completedLabelId: 'preapp-completed',
    ruleSetId: 'defra_preapprequired',
    shortName: 'preapp',
    taskListModel: 'preApplication'
  },
  RECOVERY_AND_DISPOSAL_CODES: {
    id: 'recovery-and-disposal-codes',
    label: 'List the disposal and recovery codes for your activities',
    route: Routes.WASTE_RD,
    completedLabelId: 'recovery-and-disposal-completed',
    shortName: 'rdcode',
    taskListModel: 'wasteDisposalAndRecoveryCodes'
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
  SCREENING_TOOL: {
    id: 'upload-screening-tool',
    label: 'Upload screening tool',
    route: Routes.SCREENING_TOOL,
    determinants: ['screeningToolRequired'],
    completedLabelId: 'screening-tool-completed',
    shortName: 'screeningtool',
    taskListModel: 'screeningTool'
  },
  SHIP_BREAKING: {
    id: 'ship-breaking',
    label: 'Ship breaking',
    completedLabelId: 'ship-breaking-completed',
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
    route: Routes.SITE_CONDITION_REPORT,
    completedLabelId: 'site-condition-completed',
    shortName: 'sitecondition',
    taskListModel: 'siteConditionReport'
  },
  SITE_NAME_LOCATION: {
    id: 'give-site-name-and-location',
    label: 'Give site name and location',
    route: Routes.SITE_NAME,
    determinants: ['siteNameRequired'],
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
    ruleSetId: 'defra_stackheightreq',
    completedLabelId: 'stack-height-completed'
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
    label: 'Confirm vehicle storage area drainage',
    route: Routes.DRAINAGE_TYPE_DRAIN,
    completedLabelId: 'confirm-drainage-completed',
    ruleSetId: 'defra_surfacedrainagereq',
    taskListModel: 'drainageTypeDrain'
  },
  TECHNICAL_QUALIFICATION: {
    id: 'upload-technical-management-qualifications',
    label: 'Give us evidence of your technical competence',
    route: Routes.TECHNICAL_QUALIFICATION,
    completedLabelId: 'upload-completed',
    ruleSetId: 'defra_techcompetenceevreq',
    shortName: 'techcomp',
    taskListModel: 'technicalQualification'
  },
  TECHNICAL_STANDARDS: {
    id: 'technical-standards',
    label: 'List the technical standards you use',
    route: Routes.TECHNICAL_STANDARDS,
    completedLabelId: 'technical-standards-completed',
    shortName: 'techstandards',
    taskListModel: 'technicalStandards'
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
  WASTE_TREATMENT_CAPACITY: {
    id: 'waste-treatment-capacity',
    label: 'Provide your waste treatment capacity',
    route: Routes.WASTE_TREATMENT_CAPACITIES,
    completedLabelId: 'waste-treatment-capacity-completed',
    shortName: 'wastetreatmentcapacity',
    taskListModel: 'wasteTreatmentCapacity'
  },
  WASTE_TYPES_LIST: {
    id: 'upload-waste-types-list',
    label: 'List the types of waste you want to accept',
    route: Routes.WASTE_TYPES_LIST,
    completedLabelId: 'waste-types-list-completed',
    shortName: 'ewc',
    taskListModel: 'wasteTypesList'
  },
  WASTE_WEIGHTS: {
    id: 'waste-weights',
    label: 'Provide the waste storage and throughput capacity for your activities',
    route: Routes.WASTE_WEIGHTS,
    completedLabelId: 'waste-weights-completed',
    shortName: 'wasteweights',
    taskListModel: 'wasteWeights'
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
      tasks.SAVE_AND_RETURN_EMAIL,
      tasks.MCP_TEMPLATE
    ]
  },
  {
    id: 'prepare-application-section',
    label: 'Prepare application',
    tasks: [
      tasks.PRE_APPLICATION_REFERENCE,
      tasks.WASTE_RECOVERY_PLAN,
      tasks.CONTACT_DETAILS,
      tasks.PERMIT_HOLDER_DETAILS,
      tasks.SITE_NAME_LOCATION,
      tasks.MCP_DETAILS,
      tasks.MCP_BUSINESS_ACTIVITY,
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
      tasks.PRE_APPLICATION_REFERENCE,
      tasks.CONTACT_DETAILS,
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
      tasks.SITE_NAME_LOCATION,
      tasks.SITE_PLAN,
      tasks.SITE_CONDITION_REPORT,
      tasks.AIR_QUALITY_MANAGEMENT_AREA,
      tasks.NON_TECHNICAL_SUMMARY
    ]
  },
  {
    id: 'activities-section',
    label: 'Activities',
    tasks: [
      tasks.WASTE_WEIGHTS,
      tasks.WASTE_TREATMENT_CAPACITY,
      tasks.WASTE_TYPES_LIST,
      tasks.RECOVERY_AND_DISPOSAL_CODES
    ]
  },
  {
    id: 'evidence-section',
    label: 'Evidence',
    tasks: [
      tasks.AIR_DISPERSION_MODELLING_REPORT,
      tasks.SCREENING_TOOL,
      tasks.ENERGY_EFFICIENCY_REPORT,
      tasks.BEST_AVAILABLE_TECHNIQUES_ASSESSMENT,
      tasks.TECHNICAL_QUALIFICATION,
      tasks.MANAGEMENT_SYSTEM,
      tasks.FIRE_PREVENTION_PLAN,
      tasks.WASTE_RECOVERY_PLAN,
      tasks.ENVIRONMENTAL_RISK_ASSESSMENT,
      tasks.CLIMATE_CHANGE_RISK_SCREENING,
      tasks.EMISSIONS_AND_MONITORING,
      tasks.TECHNICAL_STANDARDS,
      tasks.CLINICAL_WASTE_APPENDIX,
      tasks.MANAGE_HAZARDOUS_WASTE,
      tasks.EMISSIONS_MANAGEMENT_PLAN,
      tasks.NOISE_VIBRATION_DOCUMENTS,
      tasks.ODOUR_MANAGEMENT_PLAN,
      tasks.HABITATS_ASSESSMENT,
      tasks.BATTERY_PROCESSING,
      tasks.SHIP_BREAKING,
      tasks.PEST_MANAGEMENT_PLAN
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

const mcpBespoke = [
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
      tasks.PRE_APPLICATION_REFERENCE,
      tasks.CONTACT_DETAILS,
      tasks.PERMIT_HOLDER_DETAILS,
      tasks.CONFIRM_CONFIDENTIALLY,
      tasks.INVOICING_DETAILS
    ]
  },
  {
    id: 'operations-section',
    label: 'Operations',
    tasks: [
      tasks.SITE_NAME_LOCATION,
      tasks.AIR_QUALITY_MANAGEMENT_AREA,
      tasks.NON_TECHNICAL_SUMMARY
    ]
  },
  {
    id: 'activities-section',
    label: 'Activities',
    tasks: [
      tasks.MCP_TEMPLATE,
      tasks.MCP_DETAILS,
      tasks.MCP_BUSINESS_ACTIVITY
    ]
  },
  {
    id: 'evidence-section',
    label: 'Evidence',
    tasks: [
      tasks.AIR_DISPERSION_MODELLING_REPORT,
      tasks.SCREENING_TOOL,
      tasks.ENERGY_EFFICIENCY_REPORT,
      tasks.BEST_AVAILABLE_TECHNIQUES_ASSESSMENT
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

  static get mcpBespoke () {
    return mcpBespoke
  }
}
