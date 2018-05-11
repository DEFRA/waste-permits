'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.SERVICE_NAME = 'Apply for a standard rules environmental permit'
Constants.GDS_NAME = 'GOV.UK'
Constants.COOKIE_PATH = { path: '/' }
Constants.GITHUB_LOCATION = 'https://github.com/DEFRA/waste-permits'
Constants.TIMESTAMP_FORMAT = 'DD/MM/YYYY HH:mm:ss'
Constants.PAGE_TITLE_ERROR_PREFIX = 'Problem: '
Constants.SKIP_LINK_MESSAGE = `Skip to main content`
Constants.MAX_FILE_SIZE = 31457280 // 30MB
Constants.SAVE_AND_RETURN_URL = '/r'
Constants.PAYMENT_RESULT_URL = '/pay/result'
Constants.APPLICATION_RECEIVED_URL = '/done'
Constants.PAYMENT_CARD_PROBLEM_URL = '/pay/card-problem'
Constants.ALREADY_SUBMITTED_URL = '/errors/order/done-cant-go-back'

Constants.DEFAULT_UPLOAD_OPTIONS = {
  maxSize: '30MB',
  fileTypes: [
    {type: 'PDF', mimeType: 'application/pdf'},
    {type: 'DOC', mimeType: 'application/msword'},
    {type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
    {type: 'XLS', mimeType: 'application/vnd.ms-excel'},
    {type: 'XLSX', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
    {type: 'JPG', mimeType: 'image/jpeg'},
    {type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text'},
    {type: 'ODS', mimeType: 'application/vnd.oasis.opendocument.spreadsheet'}
  ]
}

Constants.Errors = {
  REQUEST_ENTITY_TOO_LARGE: 413
}

Constants.LogLevels = {
  ERROR: 'ERROR',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
}

Constants.ALLOWED_PERMITS = [
  'SR2008 No 27',
  'SR2010 No 4',
  'SR2010 No 5',
  'SR2010 No 6',
  'SR2010 No 11',
  'SR2010 No 12',
  'SR2015 No 17'
  // *** Must be a mobile permit so this is temporarily removed ***
  // 'SR2015 No 18'
]

Constants.OFFLINE_CATEGORIES = {
  FLOOD_RISK_ACTIVITIES: {
    id: 'offline-category-flood',
    name: 'Flood',
    category: 'Flood risk activities'
  },
  RADIOACTIVE_SUBSTANCES_FOR_NON_NUCLEAR_SITES: {
    id: 'offline-category-radioactive',
    name: 'Radioactive',
    category: 'Radioactive substances for non-nuclear sites'
  },
  WATER_DISCHARGES: {
    id: 'offline-category-water',
    name: 'Water',
    category: 'Water discharges'
  }
}

Constants.PERMIT_HOLDER_TYPES = {
  LIMITED_COMPANY: {
    id: 'limited-company',
    type: 'Limited company',
    canApplyOnline: true,
    dynamicsApplicantTypeId: 910400001
  },
  INDIVIDUAL: {
    id: 'individual',
    type: 'Individual',
    canApplyOnline: true,
    dynamicsApplicantTypeId: 910400000
  },
  SOLE_TRADER: {
    id: 'sole-trader',
    type: 'Sole trader',
    canApplyOnline: false
  },
  LOCAL_AUTHORITY: {
    id: 'local-authority',
    type: 'Local authority or public body',
    canApplyOnline: false
  },
  PARTNERSHIP: {
    id: 'partnership',
    type: 'Partnership',
    canApplyOnline: false
  },
  REGISTERED_CHARITY: {
    id: 'registered-charity',
    type: 'Registered charity',
    canApplyOnline: false
  },
  LIMITED_LIABILITY_PARTNERSHIP: {
    id: 'limited-liability-partnership',
    type: 'Limited liability partnership',
    canApplyOnline: false
  },
  OTHER_ORGANISATION: {
    id: 'other-organisation',
    type: 'Other organisation, for example a club or association',
    canApplyOnline: false
  }
}

Constants.DEFRA_COOKIE_KEY = 'DefraSession'

Constants.COOKIE_RESULT = {
  VALID_COOKIE: 'The cookie is valid',
  COOKIE_NOT_FOUND: 'The cookie was not found',
  COOKIE_EXPIRED: 'The cookie has expired',
  APPLICATION_NOT_FOUND: 'The application was not found',
  APPLICATION_ALREADY_SUBMITTED: 'The application has already been submitted',
  APPLICATION_NOT_SUBMITTED: 'The application has not been submitted yet'
}

Constants.COOKIE_KEY = {
  AUTH_TOKEN: 'authToken',
  APPLICATION_ID: 'applicationId',
  APPLICATION_LINE_ID: 'applicationLineId',
  PERMIT_HOLDER_TYPE: 'permitHolderType',
  STANDARD_RULE_ID: 'standardRuleId',
  STANDARD_RULE_TYPE_ID: 'standardRuleTypeId',
  SAVE_AND_RETURN_EMAIL: 'saveAndReturnEmail',
  EXPIRY: 'expiry'
}

Constants.BankAccountDetails = {
  SORT_CODE: '60-70-80',
  ACCOUNT_NUMBER: '1001 4411',
  ACCOUNT_NAME: 'EA RECEIPTS',
  IBAN_NUMBER: 'GB23NWK60708010014411',
  SWIFT_NUMBER: 'NWBKGB2L',
  PAYMENT_EMAIL: 'psc-bacs@environment-agency.gov.uk'
}

Constants.Routes = {
  ROOT: {
    path: '/',
    pageHeading: 'Waste Permits Home Page'
  },
  ADDRESS: {
    MANUAL_INVOICE: {
      path: '/invoice/address/address-manual',
      view: 'address/manualEntry',
      pageHeading: `Where should we send invoices for the annual costs after the permit has been issued?`
    },
    MANUAL_SITE: {
      path: '/site/address/address-manual',
      view: 'address/manualEntry',
      pageHeading: `Enter the site address`
    },
    POSTCODE_INVOICE: {
      path: '/invoice/address/postcode',
      view: 'address/postcode',
      pageHeading: `Where should we send invoices for the annual costs after the permit has been issued?`,
      taskListHeading: 'Give invoicing details'
    },
    POSTCODE_SITE: {
      path: '/site/address/postcode',
      view: 'address/postcode',
      pageHeading: `What's the postcode for the site?`
    },
    SELECT_INVOICE: {
      path: '/invoice/address/select-address',
      view: 'address/selectAddress',
      pageHeading: `Where should we send invoices for the annual costs after the permit has been issued?`
    },
    SELECT_SITE: {
      path: '/site/address/select-address',
      view: 'address/selectAddress',
      pageHeading: `What's the site address?`
    }
  },
  APPLICATION_RECEIVED: {
    path: `${Constants.APPLICATION_RECEIVED_URL}/{slug?}`,
    view: 'applicationReceived',
    pageHeading: `Application received`,
    pageHeadingAlternate: `Application and card payment received`
  },
  APPLY_OFFLINE: {
    path: '/start/apply-offline',
    view: 'applyOffline',
    pageHeading: `Apply for {{{chosenOption}}}`
  },
  CHECK_BEFORE_SENDING: {
    path: '/check-before-sending',
    view: 'checkBeforeSending',
    pageHeading: 'Check your answers',
    taskListHeading: 'Send application and pay'
  },
  CHECK_YOUR_EMAIL: {
    path: '/save-return/check-your-email',
    view: 'saveAndReturn/checkYourEmail',
    pageHeading: 'Check your email',
    taskListHeading: 'Check your email'
  },
  COMPANY_CHECK_NAME: {
    path: '/permit-holder/company/check-name',
    view: 'companyCheckName',
    pageHeading: `Is this the right company?`
  },
  COMPANY_CHECK_STATUS: {
    path: '/permit-holder/company/status-not-active',
    view: 'companyCheckStatus',
    pageHeading: `We can't issue a permit to that company because it {{{companyStatus}}}`
  },
  COMPANY_CHECK_TYPE: {
    path: '/permit-holder/company/wrong-type',
    view: 'companyCheckType',
    pageHeading: `That company can’t apply because it’s {{{companyType}}}`
  },
  COMPANY_DECLARE_OFFENCES: {
    path: '/permit-holder/company/declare-offences',
    view: 'declaration/company/offences',
    pageHeading: 'Does anyone connected with your business have a conviction for a relevant offence?'
  },
  COMPANY_DECLARE_BANKRUPTCY: {
    path: '/permit-holder/company/bankruptcy-insolvency',
    view: 'declaration/company/bankruptcy',
    pageHeading: 'Do you have current or past bankruptcy or insolvency proceedings to declare?'
  },
  COMPANY_NUMBER: {
    path: '/permit-holder/company/number',
    view: 'companyNumber',
    pageHeading: `What's the UK company registration number?`,
    taskListHeading: `What's the company name or registration number?`
  },
  CONFIDENTIALITY: {
    path: '/confidentiality',
    view: 'declaration/confidentiality/confidentiality',
    pageHeading: 'Is part of your application commercially confidential?',
    taskListHeading: 'Confirm confidentiality needs'
  },
  CONFIRM_RULES: {
    path: '/confirm-rules',
    view: 'confirmRules',
    pageHeading: 'Confirm your operation meets the rules',
    taskListHeading: 'Confirm you can meet the rules'
  },
  CONTACT_DETAILS: {
    path: '/contact-details',
    view: 'contactDetails',
    pageHeading: 'Who should we contact about this application?',
    taskListHeading: 'Give contact details'
  },
  COOKIES: {
    path: '/information/cookies',
    view: 'cookies',
    pageHeading: 'Cookies'
  },
  COST_TIME: {
    path: '/costs-times',
    view: 'costTime',
    pageHeading: 'Costs and processing time',
    taskListHeading: 'Check costs and processing time'
  },
  DIRECTOR_DATE_OF_BIRTH: {
    path: '/permit-holder/company/director-date-of-birth',
    view: 'directorDateOfBirth',
    pageHeading: `What's the director's date of birth?`,
    pageHeadingAlternate: `What are the directors' dates of birth?`
  },
  DRAINAGE_TYPE_FAIL: {
    path: '/drainage-type/contact-us',
    view: 'drainageTypeFail',
    pageHeading: 'Your drainage system is not suitable - please contact us'
  },
  DRAINAGE_TYPE_DRAIN: {
    path: '/drainage-type/drain',
    view: 'drainageTypeDrain',
    pageHeading: 'Where does the vehicle storage area drain to?',
    taskListHeading: 'Confirm you have a suitable vehicle storage area'
  },
  ERROR: {
    ALREADY_SUBMITTED: {
      path: `${Constants.ALREADY_SUBMITTED_URL}/{slug?}`,
      view: 'error/alreadySubmitted',
      pageHeading: `You’ve sent your application so you can't go back and change it`
    },
    COOKIES_DISABLED: {
      path: '/errors/cookies-off',
      view: 'error/cookiesDisabled',
      pageHeading: 'You must switch on cookies to use this service'
    },
    NOT_PAID: {
      path: '/errors/order/card-payment-not-complete',
      view: 'error/notPaid',
      pageHeading: 'You need to pay for your application'
    },
    NOT_SUBMITTED: {
      path: '/errors/order/check-answers-not-complete',
      view: 'error/notSubmitted',
      pageHeading: 'You need to check your answers and submit your application'
    },
    PAGE_NOT_FOUND: {
      path: '/errors/page-not-found',
      view: 'error/pageNotFound',
      pageHeading: `We can't find that page`
    },
    RECOVERY_FAILED: {
      path: '/errors/recovery-failed',
      view: 'error/recoveryFailed',
      pageHeading: 'Sorry, we can’t find that application'
    },
    START_AT_BEGINNING: {
      path: '/errors/order/start-at-beginning',
      view: 'error/startAtBeginning',
      pageHeading: 'Please start at the beginning of the application'
    },
    TECHNICAL_PROBLEM: {
      path: '/errors/technical-problem',
      view: 'error/technicalProblem',
      pageHeading: 'Something went wrong'
    },
    TIMEOUT: {
      path: '/errors/timeout',
      view: 'error/timeout',
      pageHeading: 'Your application has timed out'
    }
  },
  FIRE_PREVENTION_PLAN: {
    path: '/fire-prevention-plan',
    view: 'upload/firePreventionPlan/firePreventionPlan',
    pageHeading: 'Upload the fire prevention plan',
    taskListHeading: 'Upload the fire prevention plan'
  },
  HEALTH: {
    path: '/health',
    pageHeading: 'Health'
  },
  MANAGEMENT_SYSTEM: {
    path: '/management-system',
    view: 'managementSystem',
    pageHeading: 'Which management system will you use?',
    taskListHeading: 'Tell us which management system you use'
  },
  PAYMENT: {
    BACS_PAYMENT: {
      path: '/pay/bacs',
      view: 'payment/paymentBacs',
      pageHeading: 'You’ve chosen to pay by bank transfer using Bacs'
    },
    CARD_PAYMENT: {
      path: '/pay/card'
    },
    CARD_PROBLEM: {
      path: `${Constants.PAYMENT_CARD_PROBLEM_URL}/{slug?}`,
      view: 'payment/cardProblem',
      pageHeading: 'Your card payment failed'
    },
    PAYMENT_RESULT: {
      path: `${Constants.PAYMENT_RESULT_URL}/{slug?}`,
      pageHeading: 'Your card payment failed'
    },
    PAYMENT_TYPE: {
      path: '/pay/type',
      view: 'payment/paymentType',
      pageHeading: 'How do you want to pay?'
    }
  },
  PERMIT_CATEGORY: {
    path: '/permit/category',
    view: 'permitCategory',
    pageHeading: 'What do you want the permit for?'
  },
  PERMIT_HOLDER_DETAILS: {
    path: '/permit-holder/details',
    taskListHeading: 'Give permit holder details'
  },
  PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH: {
    path: '/permit-holder/name',
    view: 'permitHolderNameAndDateOfBirth',
    pageHeading: 'Who will be the permit holder?'
  },
  PERMIT_HOLDER_TYPE: {
    path: '/permit-holder/type',
    view: 'permitHolderType',
    pageHeading: 'Who will be the permit holder?'
  },
  PERMIT_SELECT: {
    path: '/permit/select',
    view: 'permitSelect',
    pageHeading: 'Select a permit'
  },
  PRE_APPLICATION: {
    path: '/pre-application',
    view: 'preApplication',
    pageHeading: 'Have you discussed this application with us?',
    taskListHeading: `Tell us if you've discussed this application with us`
  },
  PRIVACY: {
    path: '/information/privacy',
    view: 'privacy',
    pageHeading: 'Privacy: how we use your personal information'
  },
  SAVE_AND_RETURN_SENT_CHECK: {
    path: '/save-return/email-sent-check',
    view: 'saveAndReturn/emailSent',
    pageHeading: 'Check your email'
  },
  SAVE_AND_RETURN_RECOVER: {
    path: `${Constants.SAVE_AND_RETURN_URL}/{slug}`,
    view: 'saveAndReturn/recover',
    pageHeading: 'We found your application'
  },
  SAVE_AND_RETURN_CONFIRM: {
    path: '/save-return/confirm',
    view: 'saveAndReturn/emailConfirm',
    pageHeading: 'Make sure this is right'
  },
  SAVE_AND_RETURN_SENT_RESENT: {
    path: '/save-return/email-sent-resent',
    view: 'saveAndReturn/emailSent',
    pageHeading: 'We’ve resent the email - check again'
  },
  SAVE_AND_RETURN_COMPLETE: {
    path: '/save-return/email-sent-task-check',
    view: 'saveAndReturn/emailSent',
    pageHeading: 'You’ve saved your application'
  },
  SAVE_AND_RETURN_EMAIL: {
    path: '/save-return/email',
    view: 'saveAndReturn/emailEnter',
    pageHeading: 'Save your application',
    taskListHeading: 'Save your application'
  },
  SEARCH_YOUR_EMAIL: {
    path: '/save-return/search-your-email',
    view: 'saveAndReturn/checkYourEmail',
    pageHeading: 'Search for ’standard rules permit application’ in your emails',
    taskListHeading: 'Search for ’standard rules permit application’ in your emails'
  },
  SITE_GRID_REFERENCE: {
    path: '/site/grid-reference',
    view: 'siteGridReference',
    pageHeading: `What's the grid reference for the centre of the site?`
  },
  SITE_PLAN: {
    path: '/site-plan',
    view: 'upload/sitePlan/sitePlan',
    pageHeading: 'Upload the site plan',
    taskListHeading: 'Upload the site plan'
  },
  SITE_NAME: {
    path: '/site/site-name',
    view: 'siteName',
    pageHeading: `What's the site name?`,
    taskListHeading: 'Give site name and location'
  },
  START_OR_OPEN_SAVED: {
    path: `/start/start-or-open-saved`,
    view: 'startOrOpenSaved',
    pageHeading: 'Apply for a standard rules environmental permit'
  },
  TASK_LIST: {
    path: '/task-list',
    view: 'taskList',
    pageHeading: 'Apply for a standard rules environmental permit'
  },
  TECHNICAL_QUALIFICATION: {
    path: '/technical-competence',
    view: 'technicalQualification',
    pageHeading: 'What evidence of technical competence do you have?',
    taskListHeading: 'Prove technical competence'
  },
  TECHNICAL_MANAGERS: {
    path: '/technical-competence/technical-managers',
    view: 'upload/technicalQualification/technicalManagers',
    pageHeading: 'Upload details for all technically competent managers'
  },
  UPLOAD_COURSE_REGISTRATION: {
    path: '/technical-competence/upload-course-registration',
    view: 'upload/technicalQualification/courseRegistration',
    pageHeading: 'Getting a qualification: upload your evidence'
  },
  UPLOAD_DEEMED_EVIDENCE: {
    path: '/technical-competence/upload-deemed-evidence',
    view: 'upload/technicalQualification/deemedEvidence',
    pageHeading: 'Deemed competence or an assessment: upload your evidence'
  },
  UPLOAD_ESA_EU_SKILLS: {
    path: '/technical-competence/upload-esa-eu-skills',
    view: 'upload/technicalQualification/esaEuSkills',
    pageHeading: 'Energy & Utility Skills / ESA: upload your evidence'
  },
  UPLOAD_WAMITAB_QUALIFICATION: {
    path: '/technical-competence/upload-wamitab-qualification',
    view: 'upload/technicalQualification/wamitabQualification',
    pageHeading: 'WAMITAB or EPOC: upload your evidence'
  },
  VERSION: {
    path: '/version',
    view: 'version',
    pageHeading: 'Waste Permits'
  },
  WASTE_RECOVERY_PLAN: {
    path: '/waste-recovery-plan',
    view: 'wasteRecoveryPlan',
    pageHeading: 'Have we checked your waste recovery plan?',
    taskListHeading: 'Get your waste recovery plan checked'
  }
}

Constants.PermitTypes = {
  STANDARD_RULES: {
    cost: {
      lower: 720,
      upper: 1690
    }
  }
}

Constants.Dynamics = {
  AccountTypes: {
    AGENT: 910400000
  },
  AddressTypes: {
    BILLING_INVOICING: {
      TYPE: 910400004,
      NAME: 'Billing Invoicing Address'
    },
    COMPANY_SECRETARY_EMAIL: {
      TYPE: 910400006,
      NAME: 'Company Secretary Email Address'
    },
    PRIMARY_CONTACT_TELEPHONE_NUMBER: {
      TYPE: 910400007,
      NAME: 'Primary Contact Telephone Number'
    }
  },
  COMPANY_DIRECTOR: 910400000,
  DIGITAL_SOURCE: 910400000,
  DrainageTypes: {
    SEWER: {
      id: 'sewer',
      type: 910400000,
      description: 'A sewer under a consent from the local water company',
      allowed: true
    },
    BLIND_SUMP: {
      id: 'blind-sump',
      type: 910400001,
      description: 'A blind sump to be taken off-site in a tanker for disposal or recovery',
      allowed: true
    },
    OIL_SEPARATOR: {
      id: 'oil-separator',
      type: 910400002,
      description: 'An oil separator, interceptor or other drainage system that is appropriately designed, operated and maintained',
      hint: 'If you use this system you can only store undamaged vehicles on the area. The drainage system must be designed, constructed and maintained to ensure the discharge does not adversely impact the water quality of the receiving water body.',
      allowed: true,
      exceptions: ['SR2015 No 13']
    },
    WATERCOURSE: {
      id: 'watercourse',
      type: 910400003,
      description: 'Surface water drains, a watercourse, the ground or a water body',
      allowed: false
    }
  },
  PAYMENT_CATEGORY: 910400000,
  PaymentTypes: {
    CARD_PAYMENT: 910400000,
    BACS_PAYMENT: 910400005
  },
  PaymentTitle: {
    CARD_PAYMENT: 'Inbound online payment for application',
    BACS_PAYMENT: 'Inbound BACS payment for application'
  },
  PaymentStatusCodes: {
    ISSUED: 910400004
  },
  PermitTypes: {
    STANDARD: 910400000,
    BESPOKE: 910400001
  },
  StatusCode: {
    APPLICATION_RECEIVED: 910400000,
    DRAFT: 1
  },
  TechnicalQualification: {
    WAMITAB_QUALIFICATION: {
      TYPE: 910400000,
      NAME: 'WAMITAB or EPOC qualification'
    },
    REGISTERED_ON_A_COURSE: {
      TYPE: 910400001,
      NAME: `We're getting WAMITAB or EPOC qualifications`
    },
    DEEMED_COMPETENCE: {
      TYPE: 910400002,
      NAME: 'Deemed competence or an Environment Agency assessment'
    },
    ESA_EU_SKILLS: {
      TYPE: 910400003,
      NAME: 'Energy & Utility Skills / ESA system'
    }
  },
  WamitabRiskLevel: {
    NA: 910400000,
    LOW: 910400001,
    MEDIUM: 910400002,
    HIGH: 910400003
  },
  WASTE_REGIME: 910400000,

  RulesetIds: {
    ALLOW_PERMIT_START_DATE: 'defra_allowpermitstartdate',
    BASELINE_REPORT: 'defra_baselinereportreq',
    CONFIRM_CONFIDENTIALLY: 'defra_cnfconfidentialityreq',
    CONFIRM_RULES: 'defra_confirmreadrules',
    CONTACT_DETAILS: 'defra_contactdetailsrequired',
    DEFRA_WASTE_WEIGHT: 'defra_extwasteweightreq',
    FIRE_PREVENTION_PLAN: 'defra_fireplanrequired',
    INVOICING_DETAILS: 'defra_invoicingdetailsrequired',
    MANAGEMENT_SYSTEM: 'defra_mansystemrequired',
    MINING_WASTE_MANAGEMENT_PLAN: 'defra_miningwastemanplanreq',
    NHS_SCREENING: 'defra_nhscreeningrequired',
    PERMIT_HOLDER_DETAILS: 'defra_pholderdetailsrequired',
    PRE_APPLICATION: 'defra_preapprequired',
    SAVE_AND_RETURN_EMAIL: 'defra_setupsaveandreturnrequired',
    SHOW_COST_AND_TIME: 'defra_showcostandtime',
    SITE_NAME_LOCATION: 'defra_locationrequired',
    SITE_PLAN: 'defra_siteplanrequired',
    STACK_HEIGHT: 'defra_stackheightreq',
    SURFACE_DRAINAGE: 'defra_surfacedrainagereq',
    TECHNICAL_QUALIFICATION: 'defra_techcompetenceevreq',
    WASTE_RECOVERY_PLAN: 'defra_wasterecoveryplanreq'
  },
  CompletedParamters: {
    ALLOW_PERMIT_START_DATE: 'defra_allowpermitstartdate_completed',
    BASELINE_REPORT: 'defra_baselinereportreq_completed',
    CONFIRM_CONFIDENTIALLY: 'defra_cnfconfidentialityreq_completed',
    CONFIRM_RULES: 'defra_confirmreadrules_completed',
    CONTACT_DETAILS: 'defra_contactdetailsrequired_completed',
    DEFRA_WASTE_WEIGHT: 'defra_extwasteweightreq_completed',
    FIRE_PREVENTION_PLAN: 'defra_fireplanrequired_completed',
    INVOICING_DETAILS: 'defra_invoicingdetails_completed',
    MANAGEMENT_SYSTEM: 'defra_mansystemrequired_completed',
    MINING_WASTE_MANAGEMENT_PLAN: 'defra_miningwastemanplanreq_completed',
    NHS_SCREENING: 'defra_nhscreeningrequired_completed',
    PERMIT_HOLDER_DETAILS: 'defra_pholderdetailsrequired_completed',
    PRE_APPLICATION: 'defra_preapprequired_completed',
    SAVE_AND_RETURN_EMAIL: 'defra_setupsaveandreturn_completed',
    SHOW_COST_AND_TIME: 'defra_showcostandtime_completed',
    SITE_NAME_LOCATION: 'defra_locationrequired_completed',
    SITE_PLAN: 'defra_siteplanrequired_completed',
    STACK_HEIGHT: 'defra_stackheightreq_completed',
    SURFACE_DRAINAGE: 'defra_surfacedrainagereq_completed',
    TECHNICAL_QUALIFICATION: 'defra_techcompetenceevreq_completed',
    WASTE_RECOVERY_PLAN: 'defra_wasterecoveryplanreq_completed'
  }
}

Constants.TaskList = {
  SectionHeadings: {
    BEFORE_YOU_APPLY: 'Before you apply',
    PREPARE_APPLICATION: 'Prepare application',
    APPLY: 'Apply'
  }
}

Constants.Company = {
  Status: {
    ACTIVE: 'is active',
    DISSOLVED: 'has been dissolved',
    LIQUIDATION: 'has gone into liquidation',
    RECEIVERSHIP: 'is in receivership',
    ADMINISTRATION: 'is in administration',
    VOLUNTARY_ARRANGEMENT: 'is insolvent and has a Company Voluntary Arrangement',
    CONVERTED_CLOSED: 'has been closed or converted',
    INSOLVENCY_PROCEEDINGS: 'is insolvent',
    NOT_ACTIVE: `isn't active`,
    NO_DIRECTORS: `has no directors`,
    NOT_APPLICABLE_COMPANY_TYPE: `is not applicable for this company type`
  },
  Type: {
    UK_ESTABLISHMENT: 'a UK establishment company'
  }
}

Constants.UploadSubject = {
  TECHNICAL_QUALIFICATION: 'technical qualification',
  SITE_PLAN: 'site plan',
  FIRE_PREVENTION_PLAN: 'fire prevention plan',
  TECHNICAL_MANAGERS: 'technical managers'
}

Constants.CookieValue = {
  INVOICE_POSTCODE: 'INVOICE_POSTCODE',
  SITE_POSTCODE: 'SITE_POSTCODE'
}

Constants.CacheOptions = {
  privacy: 'private',
  statuses: [200],
  expiresIn: 0,
  otherwise: 'no-cache'
}

Constants.SecurityOptions = {
  hsts: {
    includeSubDomains: true,
    preload: true
  }
}

Constants.buildPageTitle = (pageHeading) => {
  return `${pageHeading} - ${Constants.SERVICE_NAME} - ${Constants.GDS_NAME}`
}

Constants.Validation = {
  EMAIL_VALID_REGEX: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
}

Constants.getVersion = () => {
  let version
  try {
    // Read the application version number
    let json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    if (json) {
      version = json.version
    } else {
      throw new Error('Application version not found')
    }
  } catch (err) {
    version = 'Unknown'
  }
  return version
}
