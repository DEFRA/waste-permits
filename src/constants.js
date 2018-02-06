'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.SERVICE_NAME = 'Waste Permits'
Constants.GDS_NAME = 'GOV.UK'
Constants.COOKIE_KEY = 'DefraSession'
Constants.COOKIE_PATH = { path: '/' }
Constants.GITHUB_LOCATION = 'https://github.com/DEFRA/waste-permits'
Constants.TIMESTAMP_FORMAT = 'DD/MM/YYYY HH:mm:ss'
Constants.PAGE_TITLE_ERROR_PREFIX = 'Problem: '
Constants.SKIP_LINK_MESSAGE = `Skip to main content`
Constants.MAX_FILE_SIZE = 31457280 // 30MB

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
  'SR2010 No 12'
  // *** Must be a mobile permit so this is temporarily removed ***
  // 'SR2015 No 18'
]

Constants.Routes = {
  ROOT: {
    path: '/',
    pageHeading: 'Waste Permits Home Page'
  },
  ADDRESS: {
    MANUAL_INVOICE: {
      path: '/invoice/address/address-manual',
      pageHeading: `Where should we send invoices for the annual costs after the permit has been issued?`
    },
    MANUAL_SITE: {
      path: '/site/address/address-manual',
      pageHeading: `Enter the site address`
    },
    POSTCODE_INVOICE: {
      path: '/invoice/address/postcode',
      pageHeading: `Where should we send invoices for the annual costs after the permit has been issued?`,
      taskListHeading: 'Give invoicing details'
    },
    POSTCODE_SITE: {
      path: '/site/address/postcode',
      pageHeading: `What's the postcode for the site?`
    },
    SELECT_INVOICE: {
      path: '/invoice/address/select-address',
      pageHeading: `What's the invoice address?`
    },
    SELECT_SITE: {
      path: '/site/address/select-address',
      pageHeading: `What's the site address?`
    }
  },
  APPLICATION_RECEIVED: {
    path: '/done',
    pageHeading: `Application received`
  },
  APPLICATION_SENT: {
    path: '/done/application-sent',
    pageHeading: `You can’t go back to your application because it’s been sent`
  },
  CHECK_BEFORE_SENDING: {
    path: '/check-before-sending',
    pageHeading: 'Check your answers before sending your application',
    taskListHeading: 'Send application and pay'
  },
  CHECK_YOUR_EMAIL: {
    path: '/save-and-return/check-your-email',
    pageHeading: `Search for 'standard rules permit application' in your email`,
    taskListHeading: `Search for 'standard rules permit application' in your email`
  },
  COMPANY_CHECK_NAME: {
    path: '/permit-holder/company/check-name',
    pageHeading: `Is this the right company?`
  },
  COMPANY_DECLARE_OFFENCES: {
    path: '/permit-holder/company/declare-offences',
    pageHeading: 'Does anyone connected with your business have a conviction for a relevant offence?'
  },
  COMPANY_DECLARE_BANKRUPTCY: {
    path: '/permit-holder/company/bankruptcy-insolvency',
    pageHeading: 'Do you have current or past bankruptcy or insolvency proceedings to declare?'
  },
  COMPANY_NUMBER: {
    path: '/permit-holder/company/number',
    pageHeading: `What's the UK company registration number?`,
    taskListHeading: `What's the company name or registration number?`
  },
  COMPANY_CHECK_STATUS: {
    path: '/permit-holder/company/status-not-active',
    pageHeading: `We can't issue a permit to that company because it {{{companyStatus}}}`
  },
  CONFIDENTIALITY: {
    path: '/confidentiality',
    pageHeading: 'Is part of your application commercially confidential?',
    taskListHeading: 'Confirm confidentiality needs'
  },
  CONFIRM_RULES: {
    path: '/confirm-rules',
    pageHeading: 'Confirm your operation meets the rules',
    taskListHeading: 'Confirm you can meet the rules'
  },
  CONTACT_DETAILS: {
    path: '/contact-details',
    pageHeading: 'Who should we contact about this application?',
    taskListHeading: 'Give contact details'
  },
  CONTACT_SEARCH: {
    path: '/contact-search',
    pageHeading: 'Contact search',
    taskListHeading: 'Contact search'
  },
  COST_TIME: {
    path: '/cost-time',
    pageHeading: 'Costs and processing time',
    taskListHeading: 'Check costs and processing time'
  },
  DIRECTOR_DATE_OF_BIRTH: {
    path: '/permit-holder/company/director-date-of-birth',
    pageHeading: `What is the director's date of birth?`,
    pageHeadingAlternate: `What are the directors' dates of birth?`
  },
  DRAINAGE_TYPE_DRAIN: {
    path: '/drainage-type/drain',
    pageHeading: 'Declaration for vehicle storage, depolution and dismantling facilities',
    taskListHeading: 'Confirm the drainage system for your site'
  },
  ERROR: {
    path: '/error',
    pageHeading: 'Something went wrong'
  },
  FIRE_PREVENTION_PLAN: {
    path: '/fire-prevention-plan',
    pageHeading: 'Upload the fire prevention plan',
    taskListHeading: 'Upload the fire prevention plan'
  },
  HEALTH: {
    path: '/health',
    pageHeading: 'Health'
  },
  MANAGEMENT_SYSTEM: {
    path: '/management-system',
    pageHeading: 'Which management system will you use?',
    taskListHeading: 'Tell us which management system you use'
  },
  PAGE_NOT_FOUND: {
    path: '/page-not-found',
    pageHeading: `We can't find that page`
  },
  PERMIT_CATEGORY: {
    path: '/permit/category',
    pageHeading: 'What do you want the permit for?'
  },
  PERMIT_HOLDER_TYPE: {
    path: '/permit-holder/type',
    pageHeading: 'Who will be the permit holder?',
    taskListHeading: 'Give company details'
  },
  PERMIT_SELECT: {
    path: '/permit/select',
    pageHeading: 'Select a permit'
  },
  PRE_APPLICATION: {
    path: '/pre-application',
    pageHeading: 'Have you discussed this application with us?',
    taskListHeading: `Tell us if you've discussed this application with us`
  },
  SITE_GRID_REFERENCE: {
    path: '/site/grid-reference',
    pageHeading: `What's the grid reference for the centre of the site?`
  },
  SITE_PLAN: {
    path: '/site-plan',
    pageHeading: 'Upload the site plan',
    taskListHeading: 'Upload the site plan'
  },
  SITE_NAME: {
    path: '/site/site-name',
    pageHeading: `What's the site name?`,
    taskListHeading: 'Give site name and location'
  },
  START_OR_OPEN_SAVED: {
    path: `/start/start-or-open-saved`,
    // For MVP we are only supporting the mobile plant standard rules waste permit
    // pageHeading: 'Apply for a standard rules waste permit'
    pageHeading: 'Apply for a mobile plant standard rules waste permit'
  },
  TASK_LIST: {
    path: '/task-list',
    pageHeading: 'Apply for a standard rules waste permit'
  },
  TECHNICAL_QUALIFICATION: {
    path: '/technical-qualification',
    pageHeading: 'Who will provide technical management on your site?',
    taskListHeading: 'Give technical management details'
  },
  UPLOAD_COURSE_REGISTRATION: {
    path: '/technical-qualification/upload-course-registration',
    pageHeading: 'Upload the course registration email or letter'
  },
  UPLOAD_DEEMED_EVIDENCE: {
    path: '/technical-qualification/upload-deemed-evidence',
    pageHeading: 'Upload evidence of their qualification'
  },
  UPLOAD_ESA_EU_SKILLS: {
    path: '/technical-qualification/upload-esa-eu-skills',
    pageHeading: 'Upload the ESA EU Skills scheme certificate'
  },
  UPLOAD_WAMITAB_QUALIFICATION: {
    path: '/technical-qualification/upload-wamitab-qualification',
    pageHeading: 'Upload the WAMITAB certificate'
  },
  VERSION: {
    path: '/version',
    pageHeading: 'Waste Permits'
  },
  WASTE_RECOVERY_PLAN: {
    path: '/waste-recovery-plan',
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
  PermitTypes: {
    STANDARD: 910400000,
    BESPOKE: 910400001
  },
  StatusCode: {
    DRAFT: 1
  },
  TechnicalQualification: {
    WAMITAB_QUALIFICATION: 910400000,
    REGISTERED_ON_A_COURSE: 910400001,
    DEEMED_COMPETENCE: 910400002,
    ESA_EU_SKILLS: 910400003
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
    PREPARE_APPLICATION: 'Prepare application',
    APPLY: 'Apply'
  }
}

Constants.CompanyStatus = {
  ACTIVE: 'is active',
  DISSOLVED: 'has been dissolved',
  LIQUIDATION: 'has gone into liquidation',
  RECEIVERSHIP: 'is in receivership',
  ADMINISTRATION: 'is in administration',
  VOLUNTARY_ARRANGEMENT: 'is insolvent and has a Company Voluntary Arrangement',
  CONVERTED_CLOSED: 'has been closed or converted',
  INSOLVENCY_PROCEEDINGS: 'is insolvent',
  NOT_ACTIVE: `isn't active`
}

Constants.CookieValue = {
  INVOICE_POSTCODE: 'INVOICE_POSTCODE'
}

Constants.buildPageTitle = (pageHeading) => {
  return `${pageHeading} - ${Constants.SERVICE_NAME} - ${Constants.GDS_NAME}`
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
