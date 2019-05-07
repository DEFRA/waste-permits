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

Constants.DEFAULT_UPLOAD_OPTIONS = {
  maxSize: '30MB',
  fileTypes: [
    { type: 'PDF', mimeType: 'application/pdf' },
    { type: 'DOC', mimeType: 'application/msword' },
    { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { type: 'XLS', mimeType: 'application/vnd.ms-excel' },
    { type: 'XLSX', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { type: 'JPG', mimeType: 'image/jpeg' },
    { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' },
    { type: 'ODS', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' }
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

Constants.MCP_CATEGORY_NAMES = [
  'mcpd-mcp',
  'mcpd-sg'
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

Constants.PROCESSING_TIME = {
  default: '13 weeks'
}
Constants.MCP_CATEGORY_NAMES.forEach((mcpCategoryName) => {
  Constants.PROCESSING_TIME[mcpCategoryName] = '9 weeks'
})

Constants.PAYMENT_CONFIGURATION_PREFIX = {
  WASTE_PREFIX: 'WastePermits.ECOM.',
  MCP_PREFIX: 'MCP.ECOM.'
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
  SWIFT_NUMBER: 'NWBKGB2L'
}

Constants.PermitTypes = {
  STANDARD_RULES: {
    id: 'standard-rules',
    cost: {
      lower: 720,
      upper: 1690
    },
    VEHICLE_DISMANTLING_LESS_THAN_75000_TONS: 'SR2015 No 13',
    WASTE_IN_DEPOSIT_FOR_RECOVERY: 'SR2015 No 39',
    CONFIRM_MINING_WASTE_MANAGEMENT_PLAN: 'SR2014 No 2',
    MOBILE_GENERATOR_0_TO_20_MW: 'SR2018 No 8'
  },
  BESPOKE: {
    id: 'bespoke'
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
  AIR_DISPERSION_MODELLING_REPORT: 'air dispersion modelling report',
  SCREENING_TOOL: 'screening tool',
  ENERGY_EFFICIENCY_REPORT: 'energy efficiency report',
  TECHNICAL_QUALIFICATION: 'technical qualification',
  BEST_AVAILABLE_TECHNIQUES_ASSESSMENT: 'best available techniques assessment',
  SITE_PLAN: 'site plan',
  FIRE_PREVENTION_PLAN: 'fire prevention plan',
  WASTE_RECOVERY_PLAN: 'waste recovery plan',
  TECHNICAL_MANAGERS: 'technical managers',
  WASTE_TYPES_LIST: 'list of waste types',
  ENVIRONMENTAL_RISK_ASSESSMENT: 'environmental risk assessment',
  NON_TECHNICAL_SUMMARY: 'non-technical summary',
  MANAGEMENT_SYSTEM_SUMMARY: 'management system summary',
  MCP_DETAILS: 'mcp details',
  ARBITRARY_UPLOADS: 'arbitrary uploads'
}

Constants.CookieValue = {
  INVOICE_POSTCODE: 'INVOICE_POSTCODE',
  PARTNER_POSTCODE: 'PARTNER_POSTCODE',
  PUBLIC_BODY_POSTCODE: 'PUBLIC_BODY_POSTCODE',
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
  EMAIL_VALID_REGEX: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  LEADING_AND_TRAILING_DASHES_REGEX: /(^-.*$|^.*-$)/,
  LETTERS_HYPHENS_AND_APOSTROPHES_REGEX: /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/,
  PLUSES_AND_SPACES_REGEX: /(\+|\s)/g,
  PLUSES_SPACES_AND_NUMBERS_REGEX: /^[0-9 +]*$/,
  PLUSES_CANNOT_PRECEDE_ZERO: /^(\+[ ]*[1-9][0-9 ]*|[^+][0-9 ]*)$/
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
