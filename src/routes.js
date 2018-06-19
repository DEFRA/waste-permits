const Constants = require('./constants')

const Routes = {
  ROOT: {
    path: '/',
    pageHeading: 'Waste Permits Home Page',
    controller: 'root',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },

  // ADDRESS
  // *******
  MANUAL_INVOICE: {
    path: '/invoice/address/address-manual',
    view: 'address/manualEntry',
    pageHeading: 'Where should we send invoices for the annual costs after the permit has been issued?',
    controller: 'address/invoice/addressManualInvoice',
    validator: 'address/addressManual',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  MANUAL_PERMIT_HOLDER: {
    path: '/permit-holder/address/address-manual',
    view: 'address/manualEntry',
    pageHeading: 'What is their address?',
    controller: 'address/permitHolder/addressManualPermitHolder',
    validator: 'address/addressManual',
    nextRoute: 'COMPANY_DECLARE_OFFENCES',
    types: 'GET, POST'
  },
  MANUAL_SITE: {
    path: '/site/address/address-manual',
    view: 'address/manualEntry',
    pageHeading: 'Enter the site address',
    controller: 'address/site/addressManualSite',
    validator: 'address/addressManual',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  POSTCODE_INVOICE: {
    path: '/invoice/address/postcode',
    view: 'address/postcode',
    pageHeading: 'Where should we send invoices for the annual costs after the permit has been issued?',
    taskListHeading: 'Give invoicing details',
    controller: 'address/invoice/postcodeInvoice',
    validator: 'address/postcode',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  POSTCODE_PERMIT_HOLDER: {
    path: '/permit-holder/address/postcode',
    view: 'address/postcode',
    pageHeading: 'What is their address?',
    controller: 'address/permitHolder/postcodePermitHolder',
    validator: 'address/postcode',
    nextRoute: 'COMPANY_DECLARE_OFFENCES',
    types: 'GET, POST'
  },
  POSTCODE_SITE: {
    path: '/site/address/postcode',
    view: 'address/postcode',
    pageHeading: 'What is the postcode for the site?',
    controller: 'address/site/postcodeSite',
    validator: 'address/postcode',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  SELECT_INVOICE: {
    path: '/invoice/address/select-address',
    view: 'address/selectAddress',
    pageHeading: 'Where should we send invoices for the annual costs after the permit has been issued?',
    controller: 'address/invoice/selectInvoice',
    validator: 'address/addressSelect',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  SELECT_PERMIT_HOLDER: {
    path: '/permit-holder/address/select-address',
    view: 'address/selectAddress',
    pageHeading: 'What is their address?',
    controller: 'address/permitHolder/selectPermitHolder',
    validator: 'address/addressSelect',
    nextRoute: 'COMPANY_DECLARE_OFFENCES',
    types: 'GET, POST'
  },
  SELECT_SITE: {
    path: '/site/address/select-address',
    view: 'address/selectAddress',
    pageHeading: 'What is the site address?',
    controller: 'address/site/selectSite',
    validator: 'address/addressSelect',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },

  // PERMIT HOLDER
  // *************
  COMPANY_CHECK_NAME: {
    path: '/permit-holder/company/check-name',
    view: 'companyCheckName',
    pageHeading: 'Is this the right company?',
    controller: 'companyCheckName',
    validator: 'companyCheckName',
    types: 'GET, POST'
  },
  COMPANY_CHECK_STATUS: {
    path: '/permit-holder/company/status-not-active',
    view: 'companyCheckStatus',
    pageHeading: 'We cannot issue a permit to that company because it {{{companyStatus}}}',
    controller: 'companyCheckStatus',
    validator: true,
    types: 'GET'
  },
  COMPANY_CHECK_TYPE: {
    path: '/permit-holder/company/wrong-type',
    view: 'companyCheckType',
    pageHeading: 'That company cannot apply because it is {{{companyType}}}',
    controller: 'companyCheckType',
    validator: true,
    types: 'GET'
  },
  COMPANY_DECLARE_OFFENCES: {
    path: '/permit-holder/company/declare-offences',
    view: 'declaration/company/offences',
    pageHeading: 'Does anyone connected with your business have a conviction for a relevant offence?',
    controller: 'declaration/company/offences',
    validator: 'declaration/company/offences',
    nextRoute: 'COMPANY_DECLARE_BANKRUPTCY',
    types: 'GET, POST'
  },
  COMPANY_DECLARE_BANKRUPTCY: {
    path: '/permit-holder/company/bankruptcy-insolvency',
    view: 'declaration/company/bankruptcy',
    pageHeading: 'Do you have current or past bankruptcy or insolvency proceedings to declare?',
    controller: 'declaration/company/bankruptcy',
    validator: 'declaration/company/bankruptcy',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  COMPANY_DIRECTOR_EMAIL: {
    path: '/permit-holder/company/director-email',
    view: 'companyDirectorEmail',
    pageHeading: 'What is the email address for the Company Secretary or a director?',
    controller: 'companyDirectorEmail',
    validator: 'companyDirectorEmail',
    types: 'GET, POST'
  },
  COMPANY_NUMBER: {
    path: '/permit-holder/company/number',
    view: 'companyNumber',
    pageHeading: 'What is the UK company registration number?',
    taskListHeading: 'What is the company name or registration number?',
    controller: 'companyNumber',
    validator: 'companyNumber',
    types: 'GET, POST'
  },
  DIRECTOR_DATE_OF_BIRTH: {
    path: '/permit-holder/company/director-date-of-birth',
    view: 'directorDateOfBirth',
    pageHeading: 'What is the director\'s date of birth?',
    pageHeadingAlternate: 'What are the directors\' dates of birth?',
    controller: 'directorDateOfBirth',
    validator: 'directorDateOfBirth',
    types: 'GET, POST'
  },
  PERMIT_HOLDER_DETAILS: {
    path: '/permit-holder/details',
    taskListHeading: 'Give permit holder details',
    controller: 'permitHolder/permitHolderDetails',
    types: 'GET'
  },
  PERMIT_HOLDER_CONTACT_DETAILS: {
    path: '/permit-holder/contact-details',
    view: 'permitHolder/permitHolderContactDetails',
    pageHeading: 'What are the permit holder\'s contact details?',
    controller: 'permitHolder/permitHolderContactDetails',
    validator: 'permitHolder/permitHolderContactDetails',
    types: 'GET, POST'
  },
  PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH:
  {
    path: '/permit-holder/name',
    view: 'permitHolder/permitHolderNameAndDateOfBirth',
    pageHeading: 'Who will be the permit holder?',
    controller: 'permitHolder/permitHolderNameAndDateOfBirth',
    validator: 'permitHolder/permitHolderNameAndDateOfBirth',
    types: 'GET, POST'
  },
  PERMIT_HOLDER_TRADING_NAME: {
    path: '/permit-holder/trading-name',
    view: 'permitHolder/permitHolderTradingName',
    pageHeading: 'Do they do business using their own name or a trading name?',
    controller: 'permitHolder/permitHolderTradingName',
    validator: 'permitHolder/permitHolderTradingName',
    types: 'GET, POST'
  },
  PERMIT_HOLDER_TYPE: {
    path: '/permit-holder',
    view: 'permitHolder/permitHolderType',
    pageHeading: 'Who will be the permit holder?',
    controller: 'permitHolder/permitHolderType',
    validator: 'permitHolder/permitHolderType',
    types: 'GET, POST'
  },

  // PAYMENT
  // *******
  BACS_PAYMENT: {
    path: '/pay/bacs',
    view: 'payment/paymentBacs',
    pageHeading: 'You have chosen to pay by bank transfer using Bacs',
    controller: 'payment/paymentBacs',
    types: 'GET, POST',
    submittedRequired: true
  },
  CARD_PAYMENT: {
    path: '/pay/card',
    controller: 'payment/cardPayment',
    types: 'GET',
    submittedRequired: true
  },
  CARD_PROBLEM: {
    path: `${Constants.PAYMENT_CARD_PROBLEM_URL}/{slug?}`,
    view: 'payment/cardProblem',
    pageHeading: 'Your card payment failed',
    controller: 'payment/paymentType',
    validator: 'paymentType',
    types: 'GET, POST',
    cookieValidationRequired: false,
    submittedRequired: true
  },
  PAYMENT_RESULT: {
    path: `${Constants.PAYMENT_RESULT_URL}/{slug?}`,
    pageHeading: 'Your card payment failed',
    controller: 'payment/paymentResult',
    types: 'GET, POST',
    cookieValidationRequired: false,
    submittedRequired: true
  },
  PAYMENT_TYPE: {
    path: '/pay/type',
    view: 'payment/paymentType',
    pageHeading: 'How do you want to pay?',
    controller: 'payment/paymentType',
    validator: 'paymentType',
    types: 'GET, POST',
    submittedRequired: true
  },

  // ERRORS
  // ******
  ALREADY_SUBMITTED: {
    path: `${Constants.ALREADY_SUBMITTED_URL}/{slug?}`,
    view: 'error/alreadySubmitted',
    pageHeading: 'You have sent your application so you cannot go back and change it',
    controller: 'error/alreadySubmitted',
    types: 'GET',
    cookieValidationRequired: false
  },
  COOKIES_DISABLED: {
    path: '/errors/cookies-off',
    view: 'error/cookiesDisabled',
    pageHeading: 'You must switch on cookies to use this service',
    controller: 'error/cookiesDisabled',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  NOT_PAID: {
    path: '/errors/order/card-payment-not-complete',
    view: 'error/notPaid',
    pageHeading: 'You need to pay for your application',
    controller: 'error/notPaid',
    types: 'GET'
  },
  NOT_SUBMITTED: {
    path: '/errors/order/check-answers-not-complete',
    view: 'error/notSubmitted',
    pageHeading: 'You need to check your answers and submit your application',
    controller: 'error/notSubmitted',
    types: 'GET',
    cookieValidationRequired: false
  },
  PAGE_NOT_FOUND: {
    path: '/errors/page-not-found',
    view: 'error/pageNotFound',
    pageHeading: 'We cannot find that page',
    controller: 'error/pageNotFound',
    types: 'GET',
    applicationRequired: false
  },
  RECOVERY_FAILED: {
    path: '/errors/recovery-failed',
    view: 'error/recoveryFailed',
    pageHeading: 'Sorry, we cannot find that application',
    controller: 'error/recoveryFailed',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  START_AT_BEGINNING: {
    path: '/errors/order/start-at-beginning',
    view: 'error/startAtBeginning',
    pageHeading: 'Please start at the beginning of the application',
    controller: 'error/startAtBeginning',
    types: 'GET',
    cookieValidationRequired: false
  },
  TECHNICAL_PROBLEM: {
    path: '/errors/technical-problem',
    view: 'error/technicalProblem',
    pageHeading: 'Something went wrong',
    controller: 'error/technicalProblem',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  TIMEOUT: {
    path: '/errors/timeout',
    view: 'error/timeout',
    pageHeading: 'Your application has timed out',
    controller: 'error/timeout',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },

  // OTHER
  // *****
  APPLICATION_RECEIVED: {
    path: `${Constants.APPLICATION_RECEIVED_URL}/{slug?}`,
    view: 'applicationReceived',
    pageHeading: 'Application received',
    pageHeadingAlternate: 'Application and card payment received',
    controller: 'applicationReceived',
    types: 'GET',
    cookieValidationRequired: false,
    submittedRequired: true,
    paymentRequired: true
  },
  APPLY_OFFLINE: {
    path: '/start/apply-offline',
    view: 'applyOffline',
    pageHeading: 'Apply for {{{chosenOption}}}',
    controller: 'applyOffline',
    types: 'GET'
  },
  CHECK_BEFORE_SENDING: {
    path: '/check-before-sending',
    view: 'checkBeforeSending',
    pageHeading: 'Check your answers',
    taskListHeading: 'Send application and pay',
    controller: 'checkBeforeSending',
    types: 'GET, POST'
  },
  CHECK_YOUR_EMAIL: {
    path: '/save-return/check-your-email',
    view: 'saveAndReturn/checkYourEmail',
    pageHeading: 'Check your email',
    taskListHeading: 'Check your email',
    controller: 'saveAndReturn/checkYourEmail',
    validator: 'saveAndReturn',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  CONFIDENTIALITY: {
    path: '/confidentiality',
    view: 'declaration/confidentiality/confidentiality',
    pageHeading: 'Is part of your application commercially confidential?',
    taskListHeading: 'Confirm confidentiality needs',
    controller: 'declaration/confidentiality/confidentiality',
    validator: 'declaration/confidentiality/confidentiality',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  CONFIRM_RULES: {
    path: '/confirm-rules',
    view: 'confirmRules',
    pageHeading: 'Confirm your operation meets the rules',
    taskListHeading: 'Confirm you can meet the rules',
    controller: 'confirmRules',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  CONTACT_DETAILS: {
    path: '/contact-details',
    view: 'contactDetails',
    pageHeading: 'Who should we contact about this application?',
    taskListHeading: 'Give contact details',
    controller: 'contactDetails',
    validator: 'contactDetails',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  COOKIES: {
    path: '/information/cookies',
    view: 'cookies',
    pageHeading: 'Cookies',
    controller: 'cookies',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  COST_TIME: {
    path: '/costs-times',
    view: 'costTime',
    pageHeading: 'Costs and processing time',
    taskListHeading: 'Check costs and processing time',
    controller: 'costTime',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  DRAINAGE_TYPE_FAIL: {
    path: '/drainage-type/contact-us',
    view: 'drainageTypeFail',
    pageHeading: 'Your drainage system is not suitable - please contact us',
    controller: 'drainageTypeFail',
    types: 'GET'
  },
  DRAINAGE_TYPE_DRAIN: {
    path: '/drainage-type/drain',
    view: 'drainageTypeDrain',
    pageHeading: 'Where does the vehicle storage area drain to?',
    taskListHeading: 'Confirm you have a suitable vehicle storage area',
    controller: 'drainageTypeDrain',
    validator: 'drainageTypeDrain',
    types: 'GET, POST'
  },
  FIRE_PREVENTION_PLAN: {
    path: '/fire-prevention-plan',
    view: 'upload/firePreventionPlan/firePreventionPlan',
    pageHeading: 'Upload the fire prevention plan',
    taskListHeading: 'Upload the fire prevention plan',
    controller: 'upload/firePreventionPlan/firePreventionPlan',
    validator: 'upload/upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute'
  },
  HEALTH: {
    path: '/health',
    pageHeading: 'Health'
  },
  MANAGEMENT_SYSTEM: {
    path: '/management-system',
    view: 'managementSystem',
    pageHeading: 'Which management system will you use?',
    taskListHeading: 'Tell us which management system you use',
    controller: 'managementSystem',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  PERMIT_CATEGORY: {
    path: '/permit/category',
    view: 'permitCategory',
    pageHeading: 'What do you want the permit for?',
    controller: 'permitCategory',
    validator: 'permitCategory',
    types: 'GET, POST'
  },
  PERMIT_SELECT: {
    path: '/permit/select',
    view: 'permitSelect',
    pageHeading: 'Select a permit',
    controller: 'permitSelect',
    validator: 'permitSelect',
    types: 'GET, POST'
  },
  PRE_APPLICATION: {
    path: '/pre-application',
    view: 'preApplication',
    pageHeading: 'Have you discussed this application with us?',
    taskListHeading: 'Tell us if you have discussed this application with us',
    controller: 'preApplication',
    types: 'GET, POST'
  },
  PRIVACY: {
    path: '/information/privacy',
    view: 'privacy',
    pageHeading: 'Privacy: how we use your personal information',
    controller: 'privacy',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  SAVE_AND_RETURN_SENT_CHECK: {
    path: '/save-return/email-sent-check',
    view: 'saveAndReturn/emailSent',
    pageHeading: 'Check your email',
    controller: 'saveAndReturn/emailSent',
    validator: 'saveAndReturn',
    types: 'GET, POST'
  },
  SAVE_AND_RETURN_RECOVER: {
    path: `${Constants.SAVE_AND_RETURN_URL}/{slug}`,
    view: 'saveAndReturn/recover',
    pageHeading: 'We found your application',
    controller: 'saveAndReturn/recover',
    types: 'GET, POST',
    cookieValidationRequired: false,
    paymentRequired: false
  },
  SAVE_AND_RETURN_CONFIRM: {
    path: '/save-return/confirm',
    view: 'saveAndReturn/emailConfirm',
    pageHeading: 'Make sure this is right',
    controller: 'saveAndReturn/emailConfirm',
    validator: 'saveAndReturn',
    types: 'GET, POST'
  },
  SAVE_AND_RETURN_SENT_RESENT: {
    path: '/save-return/email-sent-resent',
    view: 'saveAndReturn/emailSent',
    pageHeading: 'We have resent the email - check again',
    controller: 'saveAndReturn/emailSent',
    validator: 'saveAndReturn',
    types: 'GET, POST'
  },
  SAVE_AND_RETURN_COMPLETE: {
    path: '/save-return/email-sent-task-check',
    view: 'saveAndReturn/emailSent',
    pageHeading: 'You have saved your application',
    controller: 'saveAndReturn/emailSent',
    validator: 'saveAndReturn',
    types: 'GET, POST'
  },
  SAVE_AND_RETURN_EMAIL: {
    path: '/save-return/email',
    view: 'saveAndReturn/emailEnter',
    pageHeading: 'Save your application',
    taskListHeading: 'Save your application',
    controller: 'saveAndReturn/enterEmail',
    validator: 'saveAndReturn',
    types: 'GET, POST'
  },
  SEARCH_YOUR_EMAIL: {
    path: '/save-return/search-your-email',
    view: 'saveAndReturn/checkYourEmail',
    pageHeading: 'Search for ’standard rules permit application’ in your emails',
    taskListHeading: 'Search for ’standard rules permit application’ in your emails',
    controller: 'saveAndReturn/checkYourEmail',
    validator: 'saveAndReturn',
    types: 'GET, POST',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  SITE_GRID_REFERENCE: {
    path: '/site/grid-reference',
    view: 'siteGridReference',
    pageHeading: 'What is the grid reference for the centre of the site?',
    controller: 'siteGridReference',
    validator: 'siteGridReference',
    nextRoute: 'POSTCODE_SITE',
    types: 'GET, POST'
  },
  SITE_PLAN: {
    path: '/site-plan',
    view: 'upload/sitePlan/sitePlan',
    pageHeading: 'Upload the site plan',
    taskListHeading: 'Upload the site plan',
    controller: 'upload/sitePlan/sitePlan',
    validator: 'upload/upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute'
  },
  SITE_NAME: {
    path: '/site/site-name',
    view: 'siteName',
    pageHeading: 'What is the site name?',
    taskListHeading: 'Give site name and location',
    controller: 'siteName',
    validator: 'siteName',
    nextRoute: 'SITE_GRID_REFERENCE',
    types: 'GET, POST'
  },
  START_OR_OPEN_SAVED: {
    path: '/start/start-or-open-saved',
    view: 'startOrOpenSaved',
    pageHeading: 'Apply for a standard rules environmental permit',
    controller: 'startOrOpenSaved',
    validator: 'startOrOpenSaved',
    types: 'GET, POST',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  TASK_LIST: {
    path: '/task-list',
    view: 'taskList',
    pageHeading: 'Apply for a standard rules environmental permit',
    controller: 'taskList',
    validator: 'taskList',
    types: 'GET, POST'
  },
  TECHNICAL_QUALIFICATION: {
    path: '/technical-competence',
    view: 'technicalQualification',
    pageHeading: 'What evidence of technical competence do you have?',
    taskListHeading: 'Prove technical competence',
    controller: 'technicalQualification',
    validator: 'technicalQualification',
    types: 'GET, POST'
  },
  TECHNICAL_MANAGERS: {
    path: '/technical-competence/technical-managers',
    view: 'upload/technicalQualification/technicalManagers',
    pageHeading: 'Upload details for all technically competent managers',
    controller: 'upload/technicalQualification/technicalManagers',
    validator: 'upload/upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    validatorOptions: {
      fileTypes: [
        {type: 'DOC', mimeType: 'application/msword'},
        {type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
        {type: 'PDF', mimeType: 'application/pdf'},
        {type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text'}
      ]
    }
  },
  UPLOAD_COURSE_REGISTRATION: {
    path: '/technical-competence/upload-course-registration',
    view: 'upload/technicalQualification/courseRegistration',
    pageHeading: 'Getting a qualification: upload your evidence',
    controller: 'upload/technicalQualification/courseRegistration',
    validator: 'upload/upload',
    nextRoute: 'TECHNICAL_MANAGERS',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute'
  },
  UPLOAD_DEEMED_EVIDENCE: {
    path: '/technical-competence/upload-deemed-evidence',
    view: 'upload/technicalQualification/deemedEvidence',
    pageHeading: 'Deemed competence or an assessment: upload your evidence',
    controller: 'upload/technicalQualification/deemedEvidence',
    validator: 'upload/upload',
    nextRoute: 'TECHNICAL_MANAGERS',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute'
  },
  UPLOAD_ESA_EU_SKILLS: {
    path: '/technical-competence/upload-esa-eu-skills',
    view: 'upload/technicalQualification/esaEuSkills',
    pageHeading: 'Energy & Utility Skills / ESA: upload your evidence',
    controller: 'upload/technicalQualification/esaEuSkills',
    validator: 'upload/upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute'
  },
  UPLOAD_WAMITAB_QUALIFICATION: {
    path: '/technical-competence/upload-wamitab-qualification',
    view: 'upload/technicalQualification/wamitabQualification',
    pageHeading: 'WAMITAB or EPOC: upload your evidence',
    controller: 'upload/technicalQualification/wamitabQualification',
    validator: 'upload/upload',
    nextRoute: 'TECHNICAL_MANAGERS',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute'
  },
  VERSION: {
    path: '/version',
    view: 'version',
    pageHeading: 'Waste Permits',
    controller: 'version',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  WASTE_RECOVERY_PLAN: {
    path: '/waste-recovery-plan',
    view: 'wasteRecoveryPlan',
    pageHeading: 'Have we checked your waste recovery plan?',
    taskListHeading: 'Get your waste recovery plan checked',
    controller: 'wasteRecoveryPlan',
    types: 'GET, POST'
  }
}

module.exports = Routes
