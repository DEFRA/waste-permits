'use strict'

const fs = require('fs')

const Constants = module.exports = {}

Constants.SERVICE_NAME = 'Apply for an environmental permit'
Constants.GDS_NAME = 'GOV.UK'
Constants.COOKIE_PATH = { path: '/' }
Constants.GITHUB_LOCATION = 'https://github.com/DEFRA/waste-permits'
Constants.TIMESTAMP_FORMAT = 'DD/MM/YYYY HH:mm:ss'
Constants.PAGE_TITLE_ERROR_PREFIX = 'Problem: '
Constants.SKIP_LINK_MESSAGE = 'Skip to main content'
Constants.MAX_FILE_SIZE = 31457280 // 30MB

Constants.FILE_TYPES = {
  CSV: { extension: 'csv' },
  DOC: { extension: 'doc' },
  DOCX: { extension: 'docx' },
  JPG: { extension: ['jpg', 'jpeg'] },
  PNG: { extension: 'png' },
  ODS: { extension: 'ods' },
  ODT: { extension: 'odt' },
  PDF: { extension: 'pdf' },
  XLS: { extension: 'xls' },
  XLSX: { extension: 'xlsx' },
  AAI: { extension: 'aai' },
  ADI: { extension: 'adi' },
  AMI: { extension: 'ami' },
  APL: { extension: 'apl' },
  BPI: { extension: 'bpi' },
  DEM: { extension: 'dem' },
  DIN: { extension: 'din' },
  EMI: { extension: 'emi' },
  FAC: { extension: 'fac' },
  HRL: { extension: 'hrl' },
  MET: { extension: 'met' },
  PFL: { extension: 'pfl' },
  ROU: { extension: 'rou' },
  RUF: { extension: 'ruf' },
  SFC: { extension: 'sfc' },
  TER: { extension: 'ter' },
  VAR: { extension: 'var' },
  ABS: { extension: 'abs' },
  BIN: { extension: 'bin' },
  CNA: { extension: 'cna' },
  DAT: { extension: 'dat' },
  DBF: { extension: 'dbf' },
  DGM: { extension: 'dgm' },
  FIL: { extension: 'fil' },
  FMS: { extension: 'fms' },
  FMT: { extension: 'fmt' },
  GEO: { extension: 'geo' },
  GOT: { extension: 'got' },
  GRF: { extension: 'grf' },
  SHP: { extension: 'shp' },
  SHX: { extension: 'shx' }
}

// Add the type property to the file types
Object.entries(Constants.FILE_TYPES).forEach(([type, data]) => {
  data.type = type
})

Constants.DEFAULT_UPLOAD_OPTIONS = {
  maxSize: '30MB'
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

Constants.WASTE_CATEGORY_NAMES = [
  'transfer'
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
  Constants.PROCESSING_TIME[mcpCategoryName] = Constants.PROCESSING_TIME.default
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
    NOT_ACTIVE: 'is not active',
    NO_DESIGNATED_MEMBERS: 'has no designated members',
    NO_DIRECTORS: 'has no directors',
    NOT_APPLICABLE_COMPANY_TYPE: 'is not applicable for this company type'
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
  TECHNICAL_STANDARDS: 'list of technical standards',
  ENVIRONMENTAL_RISK_ASSESSMENT: 'environmental risk assessment',
  NON_TECHNICAL_SUMMARY: 'non-technical summary',
  MANAGEMENT_SYSTEM_SUMMARY: 'management system summary',
  MCP_DETAILS: 'mcp details',
  APPLICATION_FORM: 'application forms',
  ODOUR_MANAGEMENT_PLAN: 'odour management plan',
  ARBITRARY_UPLOADS: 'arbitrary uploads',
  EMISSIONS_MANAGEMENT_PLAN: 'dust and emissions management plan',
  SITE_CONDITION_REPORT: 'site condition report',
  EMISSIONS_AND_MONITORING_DETAILS: 'Point source emissions',
  NOISE_VIBRATION_DOCUMENTS: 'noise and vibration emissions documents',
  HAZARDOUS_WASTE_PROPOSAL: 'hazardous waste management proposal',
  HAZARDOUS_WASTE_TREATMENT_SUMMARY: 'hazardous waste treatment summary',
  HAZARDOUS_WASTE_PLANS: 'hazardous waste layout plans and process flows',
  PEST_MANAGEMENT_PLAN: 'pest management plan',
  CLINICAL_WASTE_JUSTIFICATION: 'clinical waste non-standard justification',
  CLINICAL_WASTE_TREATMENT_SUMMARY: 'clinical waste treatment summary',
  CLINICAL_WASTE_LAYOUT_PLANS: 'clinical waste layout plans and process flows',
  CLIMATE_CHANGE_RISK_ASSESSMENT: 'climate change risk assessment'
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
  LETTERS_HYPHENS_SPACES_AND_APOSTROPHES_REGEX: /^(?!(?:\S*\s){3})([A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+)$/,
  PLUSES_AND_SPACES_REGEX: /(\+|\s)/g,
  PLUSES_SPACES_AND_NUMBERS_REGEX: /^[0-9 +]*$/,
  PLUSES_CANNOT_PRECEDE_ZERO: /^(\+[ ]*[1-9][0-9 ]*|[^+][0-9 ]*)$/,
  PRE_APPLICATION_REFERENCE_REGEX: /^[A-Za-z]{3}\/[A-Za-z]{2}\d{4}[A-Za-z]{2}\/[A-Za-z]\d{3}$/
}

Constants.getVersion = () => {
  let version
  try {
    // Read the application version number
    const json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
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
