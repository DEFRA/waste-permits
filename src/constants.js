'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.SERVICE_NAME = 'Apply for a standard rules environmental permit'
Constants.GDS_NAME = 'GOV.UK'
Constants.COOKIE_PATH = {path: '/'}
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

Constants.PermitTypes = {
  STANDARD_RULES: {
    cost: {
      lower: 720,
      upper: 1690
    }
  }
}

Constants.Dynamics = {
  AccountRoleCodes: {
    COMPANY_DIRECTOR: 910400000,
    MEMBER: 910400001
  },
  AccountTypes: {
    AGENT: 910400000
  },
  AddressTypes: {
    INDIVIDUAL_PERMIT_HOLDER: {
      TYPE: 910400002,
      NAME: 'Individual Permit Holder'
    },
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
    },
    DESIGNATED_MEMBER_EMAIL: {
      TYPE: 910400004,
      NAME: 'Designated Member Email Address'
    }
  },
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
  PERMIT_HOLDER_TYPES: {
    LIMITED_COMPANY: {
      id: 'limited-company',
      type: 'Limited company',
      canApplyOnline: true,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400000
    },
    SOLE_TRADER: {
      id: 'sole-trader',
      type: 'Sole trader',
      canApplyOnline: true,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400001
    },
    INDIVIDUAL: {
      id: 'individual',
      type: 'Individual',
      canApplyOnline: true,
      dynamicsApplicantTypeId: 910400000
    },
    LOCAL_AUTHORITY: {
      id: 'local-authority',
      type: 'Local authority or public body',
      canApplyOnline: false,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400002
    },
    PARTNERSHIP: {
      id: 'partnership',
      type: 'Partnership',
      canApplyOnline: false,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400003
    },
    REGISTERED_CHARITY: {
      id: 'registered-charity',
      type: 'Registered charity',
      canApplyOnline: false,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400004
    },
    LIMITED_LIABILITY_PARTNERSHIP: {
      id: 'limited-liability-partnership',
      type: 'Limited liability partnership',
      canApplyOnline: false, // ToDo This has been implemented so will work when this is set to true
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400005
    },
    OTHER_ORGANISATION: {
      id: 'other-organisation',
      type: 'Other organisation, for example a club or association',
      canApplyOnline: false,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400006
    }
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
      NAME: `We are getting WAMITAB or EPOC qualifications`
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
  TRADING_NAME_USAGE: {
    YES: 910400000,
    NO: 910400001
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
    NOT_ACTIVE: `is not active`,
    NO_DESIGNATED_MEMBERS: `has no designated members`,
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
  PERMIT_HOLDER_POSTCODE: 'PERMIT_HOLDER_POSTCODE',
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
