const { AccountRoleCodes } = require('./dynamics')

const Routes = {
  ROOT: {
    path: '/',
    pageHeading: 'Waste Permits Home Page',
    controller: 'root',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },

  // TRIAGE
  // ******
  TRIAGE_PERMIT_TYPE: {
    path: '/select',
    view: 'triage/permitType',
    applyOfflineView: 'triage/applyOffline',
    pageHeading: 'Confirm the type of permit you want',
    controller: 'triage/triage',
    validator: 'triage/permitType',
    nextRoute: 'TRIAGE_PERMIT_HOLDER_TYPE',
    types: 'GET, POST',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  TRIAGE_PERMIT_HOLDER_TYPE: {
    path: '/select',
    params: ['permitType'],
    view: 'triage/permitHolderType',
    applyOfflineView: 'triage/applyOffline',
    pageHeading: 'Who will be the permit holder?',
    controller: 'triage/triage',
    validator: 'triage/permitHolderType',
    types: 'GET, POST',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  TRIAGE_FACILITY_TYPE: {
    path: '/select',
    params: ['permitType', 'permitHolderType'],
    view: 'triage/facilityType',
    applyOfflineView: 'triage/applyOffline',
    pageHeading: 'What type of facility do you want the permit for?',
    controller: 'triage/triage',
    validator: 'triage/facilityType',
    types: 'GET, POST',
    cookieValidationRequired: true,
    applicationRequired: false
  },
  TRIAGE_MCP_TYPE: {
    path: '/select',
    params: ['permitType', 'permitHolderType', 'facilityType'],
    view: 'triage/mcpType',
    applyOfflineView: 'triage/applyOffline',
    pageHeading: 'What is your permit for?',
    controller: 'triage/triage',
    validator: 'triage/mcpType',
    types: 'GET, POST',
    cookieValidationRequired: true,
    applicationRequired: false
  },
  TRIAGE_WASTE_ACTIVITY: {
    path: '/select',
    params: ['permitType', 'permitHolderType', 'facilityType', 'mcpType'],
    view: 'triage/wasteActivity',
    applyOfflineView: 'triage/applyOffline',
    pageHeading: 'Select all the activities you want the permit to cover',
    controller: 'triage/triage',
    validator: 'triage/wasteActivity',
    types: 'GET, POST',
    cookieValidationRequired: true,
    applicationRequired: false
  },
  TRIAGE_WASTE_ASSESSMENT: {
    path: '/select',
    params: ['permitType', 'permitHolderType', 'facilityType', 'mcpType', 'wasteActivity'],
    view: 'triage/wasteAssessment',
    applyOfflineView: 'triage/applyOffline',
    triageCompleteView: 'triage/complete',
    pageHeading: 'What plans do we need to assess?',
    controller: 'triage/triage',
    types: 'GET, POST',
    cookieValidationRequired: true,
    applicationRequired: false
  },
  TRIAGE_COMPLETE: {
    path: '/select',
    params: ['permitType', 'permitHolderType', 'facilityType', 'mcpType', 'wasteActivity', 'wasteAssessment'],
    view: 'triage/complete',
    applyOfflineView: 'triage/applyOffline',
    pageHeading: 'Confirm activities and assessments',
    controller: 'triage/triage',
    types: 'GET,POST',
    cookieValidationRequired: true,
    applicationRequired: false
  },
  // TODO: This is a temporary route. The expected end game is to remove this route, go straight to the CONFIRM_COSTS page, which will ask Dynamics for the costs (without creating the lines...Kas says this is possible) then when the user clicks 'Start Application', create the application lines in that POST
  CREATE_APPLICATION_LINES: {
    path: '/selected/create-application-lines',
    controller: 'triage/createApplicationLines',
    nextRoute: 'CONFIRM_COST',
    types: 'GET,POST'
  },
  CONFIRM_COST: {
    path: '/selected/confirm',
    view: 'triage/confirmCost',
    pageHeading: 'Confirm activities and assessments',
    controller: 'triage/confirmCost',
    nextRoute: 'TASK_LIST',
    types: 'GET,POST',
    cookieValidationRequired: true,
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
    nextRoute: 'INVOICE_CONTACT',
    types: 'GET, POST'
  },
  MANUAL_PARTNER: {
    path: '/permit-holder/partners/address/address-manual',
    params: ['partnerId'],
    view: 'address/manualEntry',
    pageHeading: 'What is the address for {{name}}?',
    controller: 'address/permitHolder/addressManualPartner',
    validator: 'address/addressManual',
    nextRoute: 'PARTNERSHIP_PARTNER_LIST',
    types: 'GET, POST'
  },
  MANUAL_POSTHOLDER: {
    path: '/permit-holder/group/post-holder/address/address-manual',
    params: ['partnerId'],
    view: 'address/manualEntry',
    pageHeading: 'What is the address for {{name}}?',
    controller: 'address/permitHolder/addressManualPostHolder',
    validator: 'address/addressManual',
    nextRoute: 'GROUP_LIST',
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
  MANUAL_PUBLIC_BODY: {
    path: '/permit-holder/public-body/address/address-manual',
    view: 'address/manualEntry',
    pageHeading: 'What is the main address for the local authority or public body?',
    pageHeadingCharity: 'What is the main address for the body?',
    controller: 'address/permitHolder/addressManualPublicBody',
    validator: 'address/addressManual',
    nextRoute: 'PUBLIC_BODY_OFFICER',
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
    controller: 'address/invoice/postcodeInvoice',
    validator: 'address/postcode',
    nextRoute: 'INVOICE_CONTACT',
    types: 'GET, POST'
  },
  POSTCODE_PARTNER: {
    path: '/permit-holder/partners/address/postcode',
    params: ['partnerId'],
    view: 'address/postcode',
    pageHeading: 'What is the address for {{name}}?',
    controller: 'address/permitHolder/postcodePartner',
    validator: 'address/postcode',
    nextRoute: 'PARTNERSHIP_PARTNER_LIST',
    types: 'GET, POST'
  },
  POSTCODE_POSTHOLDER: {
    path: '/permit-holder/group/post-holder/address/postcode',
    params: ['partnerId'],
    view: 'address/postcode',
    pageHeading: 'What is the address for {{name}}?',
    controller: 'address/permitHolder/postcodePostHolder',
    validator: 'address/postcode',
    nextRoute: 'GROUP_LIST',
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
  POSTCODE_PUBLIC_BODY: {
    path: '/permit-holder/public-body/address/postcode',
    view: 'address/postcode',
    pageHeading: 'What is the main address for the local authority or public body?',
    pageHeadingCharity: 'What is the main address for the body?',
    controller: 'address/permitHolder/postcodePublicBody',
    validator: 'address/postcode',
    nextRoute: 'PUBLIC_BODY_OFFICER',
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
    nextRoute: 'INVOICE_CONTACT',
    types: 'GET, POST'
  },
  SELECT_PARTNER: {
    path: '/permit-holder/partners/address/select-address',
    params: ['partnerId'],
    view: 'address/selectAddress',
    pageHeading: 'What is the address for {{name}}?',
    controller: 'address/permitHolder/selectPartner',
    validator: 'address/addressSelect',
    nextRoute: 'PARTNERSHIP_PARTNER_LIST',
    types: 'GET, POST'
  },
  SELECT_POSTHOLDER: {
    path: '/permit-holder/group/post-holder/address/select-address',
    params: ['partnerId'],
    view: 'address/selectAddress',
    pageHeading: 'What is the address for {{name}}?',
    controller: 'address/permitHolder/selectPostHolder',
    validator: 'address/addressSelect',
    nextRoute: 'GROUP_LIST',
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
  SELECT_PUBLIC_BODY: {
    path: '/permit-holder/public-body/address/select-address',
    view: 'address/selectAddress',
    pageHeading: 'What is the main address for the local authority or public body?',
    pageHeadingCharity: 'What is the main address for the body?',
    controller: 'address/permitHolder/selectPublicBody',
    validator: 'address/addressSelect',
    nextRoute: 'PUBLIC_BODY_OFFICER',
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
  CHARITY_PERMIT_HOLDER: {
    path: '/permit-holder/charity-permit-holder',
    view: 'charityPermitHolder',
    pageHeading: 'Choose the permit holder for the charity or trust',
    controller: 'charityPermitHolder',
    validator: 'charityPermitHolder',
    nextRoute: 'CHARITY_DETAILS',
    types: 'GET, POST'
  },
  CHARITY_DETAILS: {
    path: '/permit-holder/charity-details',
    view: 'charityDetails',
    pageHeading: 'What is the charity’s name and number?',
    controller: 'charityDetails',
    validator: 'charityDetails',
    nextRoute: 'POSTCODE_PUBLIC_BODY',
    companyRoute: 'COMPANY_NUMBER',
    individualRoute: 'PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH',
    types: 'GET, POST'
  },
  COMPANY_CHECK_NAME: {
    path: '/permit-holder/company/check-name',
    view: 'companyCheckName',
    pageHeading: 'Is this the right company?',
    controller: 'companyCheckName',
    validator: 'companyCheckName',
    nextRoute: 'DIRECTOR_DATE_OF_BIRTH',
    companyRoute: 'COMPANY_NUMBER',
    types: 'GET, POST'
  },
  COMPANY_CHECK_STATUS: {
    path: '/permit-holder/company/status-not-active',
    view: 'companyCheckStatus',
    pageHeading: 'We cannot issue a permit to that company because it {{{companyStatus}}}',
    controller: 'companyCheckStatus',
    validator: true,
    nextRoute: 'COMPANY_CHECK_NAME',
    companyRoute: 'COMPANY_NUMBER',
    types: 'GET'
  },
  COMPANY_CHECK_TYPE: {
    path: '/permit-holder/company/wrong-type',
    view: 'companyCheckType',
    pageHeading: 'That company cannot apply because it is {{{companyType}}}',
    controller: 'companyCheckType',
    validator: true,
    nextRoute: 'COMPANY_CHECK_STATUS',
    companyRoute: 'COMPANY_NUMBER',
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
    nextRoute: 'COMPANY_DECLARE_OFFENCES',
    types: 'GET, POST'
  },
  COMPANY_NUMBER: {
    path: '/permit-holder/company/number',
    view: 'companyNumber',
    pageHeading: 'What is the UK company registration number?',
    pageHeadingCharity: 'What is the company or Charitable Incorporated Organisation registration number?',
    controller: 'companyNumber',
    validator: 'companyNumber',
    nextRoute: 'COMPANY_CHECK_TYPE',
    types: 'GET, POST'
  },
  DIRECTOR_DATE_OF_BIRTH: {
    path: '/permit-holder/company/director-date-of-birth',
    view: 'directorDateOfBirth',
    pageHeading: `What is the director's date of birth?`,
    pageHeadingAlternate: `What are the directors' dates of birth?`,
    officerRole: AccountRoleCodes.COMPANY_DIRECTOR,
    controller: 'directorDateOfBirth',
    validator: 'directorDateOfBirth',
    nextRoute: 'COMPANY_DIRECTOR_EMAIL',
    types: 'GET, POST'
  },
  LLP_COMPANY_CHECK_NAME: {
    path: '/permit-holder/limited-liability-partnership/check-name',
    view: 'companyCheckName',
    pageHeading: 'Is this the right limited liability partnership?',
    controller: 'companyCheckName',
    validator: 'companyCheckName',
    nextRoute: 'LLP_MEMBER_DATE_OF_BIRTH',
    companyRoute: 'LLP_COMPANY_NUMBER',
    types: 'GET, POST'
  },
  LLP_COMPANY_DESIGNATED_MEMBER_EMAIL: {
    path: '/permit-holder/limited-liability-partnership/designated-member-email',
    view: 'designatedMemberEmail',
    pageHeading: 'Email address for one of the designated members',
    controller: 'designatedMemberEmail',
    validator: 'companyDirectorEmail',
    nextRoute: 'COMPANY_DECLARE_OFFENCES',
    types: 'GET, POST'
  },
  LLP_COMPANY_NUMBER: {
    path: '/permit-holder/limited-liability-partnership/number',
    view: 'companyNumber',
    pageHeading: `What is the company number for the  limited liability partnership?`,
    controller: 'companyNumber',
    validator: 'llpCompanyNumber',
    nextRoute: 'LLP_COMPANY_CHECK_STATUS',
    types: 'GET, POST'
  },
  LLP_COMPANY_CHECK_STATUS: {
    path: '/permit-holder/limited-liability-partnership/status-not-active',
    view: 'companyCheckStatus',
    pageHeading: 'We cannot issue a permit to that limited liability partnership (LLP) because it {{{companyStatus}}}',
    controller: 'companyCheckStatus',
    nextRoute: 'LLP_COMPANY_CHECK_NAME',
    companyRoute: 'LLP_COMPANY_NUMBER',
    validator: true,
    types: 'GET'
  },
  LLP_MEMBER_DATE_OF_BIRTH: {
    path: '/permit-holder/limited-liability-partnership/member-date-of-birth',
    view: 'directorDateOfBirth',
    pageHeading: `What is the member's date of birth?`,
    pageHeadingAlternate: `What are the members' dates of birth?`,
    officerRole: AccountRoleCodes.LLP_DESIGNATED_MEMBER,
    controller: 'directorDateOfBirth',
    validator: 'directorDateOfBirth',
    nextRoute: 'LLP_COMPANY_DESIGNATED_MEMBER_EMAIL',
    types: 'GET, POST'
  },
  INVOICE_CONTACT: {
    path: '/invoice/contact',
    view: 'invoiceContact',
    pageHeading: 'Who should we contact about invoicing or payments?',
    controller: 'invoiceContact',
    validator: 'invoiceContact',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  PUBLIC_BODY_NAME: {
    path: '/permit-holder/public-body/name',
    view: 'permitHolder/publicBodyName',
    pageHeading: 'What is the name of the local authority or public body?',
    controller: 'permitHolder/tradingName',
    validator: 'permitHolder/tradingName',
    nextRoute: 'POSTCODE_PUBLIC_BODY',
    types: 'GET, POST'
  },
  PUBLIC_BODY_OFFICER: {
    path: '/permit-holder/public-body/officer',
    view: 'permitHolder/publicBodyOfficer',
    pageHeading: 'Who is the responsible officer or executive?',
    controller: 'permitHolder/publicBodyOfficer',
    validator: 'permitHolder/publicBodyOfficer',
    nextRoute: 'PUBLIC_BODY_DECLARE_OFFENCES',
    types: 'GET, POST'
  },
  PUBLIC_BODY_DECLARE_OFFENCES: {
    path: '/permit-holder/public-body/declare-offences',
    view: 'declaration/company/offences',
    pageHeading: 'Does anyone connected with the public body or local authority have a conviction for a relevant offence?',
    pageHeadingCharity: 'Does anyone connected with the body have a conviction for a relevant offence?',
    controller: 'declaration/company/offences',
    validator: 'declaration/company/offences',
    nextRoute: 'PUBLIC_BODY_DECLARE_BANKRUPTCY',
    types: 'GET, POST'
  },
  PUBLIC_BODY_DECLARE_BANKRUPTCY: {
    path: '/permit-holder/public-body/bankruptcy-insolvency',
    view: 'declaration/company/bankruptcy',
    pageHeading: 'Does anyone connected with the public body or local authority have current or past bankruptcy or insolvency proceedings to declare?',
    pageHeadingCharity: 'Does anyone connected with the body have current or past bankruptcy or insolvency proceedings to declare?',
    controller: 'declaration/company/bankruptcy',
    validator: 'declaration/company/bankruptcy',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  PERMIT_GROUP_DECIDE: {
    path: '/permit/group/decide',
    params: ['decision?'],
    view: 'permitHolder/permitGroupDecide',
    pageHeading: 'Decide who will be the permit holders for the organisation or group',
    controller: 'permitHolder/permitGroupDecide',
    types: 'GET'
  },
  PERMIT_HOLDER_DETAILS: {
    path: '/permit-holder/details',
    controller: 'permitHolder/permitHolderDetails',
    types: 'GET'
  },
  PERMIT_HOLDER_CONTACT_DETAILS: {
    path: '/permit-holder/contact-details',
    view: 'permitHolder/permitHolderContactDetails',
    pageHeading: `What are the permit holder's contact details?`,
    controller: 'permitHolder/permitHolderContactDetails',
    validator: 'permitHolder/permitHolderContactDetails',
    nextRoute: 'POSTCODE_PERMIT_HOLDER',
    types: 'GET, POST'
  },
  PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH:
  {
    path: '/permit-holder/name',
    view: 'permitHolder/permitHolderNameAndDateOfBirth',
    pageHeading: 'Who will be the permit holder?',
    pageHeadingCharity: 'Who will hold the permit for the charity or trust?',
    controller: 'permitHolder/permitHolderNameAndDateOfBirth',
    validator: 'permitHolder/permitHolderNameAndDateOfBirth',
    nextRoute: 'PERMIT_HOLDER_CONTACT_DETAILS',
    companyRoute: 'PERMIT_HOLDER_TRADING_NAME',
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
    path: '/permit-holder/type',
    view: 'permitHolder/permitHolderType',
    pageHeading: 'Who will be the permit holder?',
    controller: 'permitHolder/permitHolderType',
    validator: 'permitHolder/permitHolderType',
    nextRoute: 'PERMIT_HOLDER_DETAILS',
    types: 'GET, POST'
  },
  GROUP_NAME: {
    path: '/permit-holder/group/name',
    view: 'permitHolder/groupName',
    pageHeading: 'What is the name of the organisation or group?',
    controller: 'permitHolder/tradingName',
    validator: 'permitHolder/groupName',
    nextRoute: 'GROUP_LIST',
    types: 'GET, POST'
  },
  GROUP_LIST: {
    path: '/permit-holder/group/list',
    params: ['addAnotherMember?'],
    view: 'permitHolder/memberList',
    pageHeading: 'Postholders you have added',
    controller: 'permitHolder/group/postholderList',
    nextRoute: 'POSTHOLDER_DECLARE_OFFENCES',
    holderRoute: 'POSTHOLDER_NAME_AND_DATE_OF_BIRTH',
    deleteRoute: 'GROUP_DELETE_POSTHOLDER',
    list: {
      min: 2,
      addParam: 'add',
      addButtonTitle: 'Add another postholder',
      submitButtonTitle: 'All postholders added - continue'
    },
    types: 'GET, POST'
  },
  GROUP_DELETE_POSTHOLDER: {
    path: '/permit-holder/group/post-holder/delete',
    params: ['partnerId'],
    view: 'permitHolder/memberDelete',
    pageHeading: 'Confirm you want to delete {{name}}',
    controller: 'permitHolder/group/postholderDelete',
    nextRoute: 'GROUP_LIST',
    deleteButtonTitle: 'Delete this postholder',
    types: 'GET, POST'
  },
  POSTHOLDER_NAME_AND_DATE_OF_BIRTH: {
    path: '/permit-holder/group/post-holder/name',
    params: ['partnerId'],
    view: 'permitHolder/permitHolderNameAndDateOfBirth',
    pageHeading: 'Add the first postholder',
    pageHeadingAdd: 'Add another postholder',
    pageHeadingEdit: 'Edit this postholder',
    controller: 'permitHolder/group/postholderNameAndDateOfBirth',
    validator: 'permitHolder/permitHolderNameAndDateOfBirth',
    nextRoute: 'POSTHOLDER_CONTACT_DETAILS',
    includesJobTitle: true,
    types: 'GET, POST'
  },
  POSTHOLDER_CONTACT_DETAILS: {
    path: '/permit-holder/group/post-holder/contact-details',
    params: ['partnerId'],
    view: 'permitHolder/permitHolderContactDetails',
    pageHeading: 'What are the contact details for {{name}}?',
    controller: 'permitHolder/group/postholderContactDetails',
    validator: 'permitHolder/permitHolderContactDetails',
    nextRoute: 'POSTCODE_POSTHOLDER',
    types: 'GET, POST'
  },
  POSTHOLDER_DECLARE_OFFENCES: {
    path: '/permit-holder/group/post-holder/declare-offences',
    view: 'declaration/company/offences',
    pageHeading: 'Does anyone connected with your group have a conviction for a relevant offence?',
    controller: 'declaration/company/offences',
    validator: 'declaration/company/offences',
    nextRoute: 'POSTHOLDER_DECLARE_BANKRUPTCY',
    types: 'GET, POST'
  },
  POSTHOLDER_DECLARE_BANKRUPTCY: {
    path: '/permit-holder/group/post-holder/bankruptcy-insolvency',
    view: 'declaration/company/bankruptcy',
    pageHeading: 'Do you have current or past bankruptcy or insolvency proceedings to declare?',
    controller: 'declaration/company/bankruptcy',
    validator: 'declaration/company/bankruptcy',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  PARTNERSHIP_TRADING_NAME: {
    path: '/permit-holder/partners/trading-name',
    view: 'permitHolder/partnershipTradingName',
    pageHeading: 'What name do you use for the partnership?',
    controller: 'permitHolder/tradingName',
    validator: 'permitHolder/partnershipTradingName',
    nextRoute: 'PARTNERSHIP_PARTNER_LIST',
    types: 'GET, POST'
  },
  PARTNERSHIP_NAME_AND_DATE_OF_BIRTH: {
    path: '/permit-holder/partners/name',
    params: ['partnerId'],
    view: 'permitHolder/permitHolderNameAndDateOfBirth',
    pageHeading: 'Add the first partner',
    pageHeadingAdd: 'Add another partner',
    pageHeadingEdit: 'Edit this partner',
    controller: 'permitHolder/partnership/partnershipNameAndDateOfBirth',
    validator: 'permitHolder/permitHolderNameAndDateOfBirth',
    nextRoute: 'PARTNERSHIP_CONTACT_DETAILS',
    types: 'GET, POST'
  },
  PARTNERSHIP_CONTACT_DETAILS: {
    path: '/permit-holder/partners/details',
    params: ['partnerId'],
    view: 'permitHolder/permitHolderContactDetails',
    pageHeading: 'What are the contact details for {{name}}?',
    controller: 'permitHolder/partnership/partnershipContactDetails',
    validator: 'permitHolder/permitHolderContactDetails',
    nextRoute: 'POSTCODE_PARTNER',
    types: 'GET, POST'
  },
  PARTNERSHIP_PARTNER_LIST: {
    path: '/permit-holder/partners/list',
    params: ['addAnotherMember?'],
    view: 'permitHolder/memberList',
    pageHeading: 'Business partners you have added to this application',
    controller: 'permitHolder/partnership/partnershipList',
    nextRoute: 'COMPANY_DECLARE_OFFENCES',
    holderRoute: 'PARTNERSHIP_NAME_AND_DATE_OF_BIRTH',
    deleteRoute: 'PARTNERSHIP_DELETE_PARTNER',
    list: {
      min: 2,
      addParam: 'add',
      addButtonTitle: 'Add another partner',
      submitButtonTitle: 'All partners added - continue'
    },
    types: 'GET, POST'
  },
  PARTNERSHIP_DELETE_PARTNER: {
    path: '/permit-holder/partners/delete',
    params: ['partnerId'],
    view: 'permitHolder/memberDelete',
    pageHeading: 'Confirm you want to delete {{name}}',
    controller: 'permitHolder/partnership/partnershipPartnerDelete',
    nextRoute: 'PARTNERSHIP_PARTNER_LIST',
    deleteButtonTitle: 'Delete this partner',
    types: 'GET, POST'
  },

  // PAYMENT
  // *******
  BACS_PAYMENT: {
    path: '/pay/bacs',
    view: 'payment/paymentBacs',
    pageHeading: 'Confirm you will pay by bank transfer using Bacs',
    controller: 'payment/paymentBacs',
    nextRoute: 'BACS_PROOF',
    types: 'GET, POST',
    tasksCompleteRequired: true
  },
  BACS_PROOF: {
    path: '/pay/bacs-proof',
    view: 'payment/bacsProof',
    pageHeading: 'Give proof of your Bacs payment before you send your application',
    controller: 'payment/bacsProof',
    validator: 'payment/bacsProof',
    nextRoute: 'APPLICATION_RECEIVED',
    types: 'GET, POST',
    tasksCompleteRequired: true
  },
  CARD_PAYMENT: {
    path: '/pay/card',
    controller: 'payment/cardPayment',
    types: 'GET',
    tasksCompleteRequired: true
  },
  CARD_PROBLEM: {
    path: '/pay/card-problem',
    params: ['slug?'],
    view: 'payment/cardProblem',
    pageHeading: 'Your card payment failed',
    controller: 'payment/paymentType',
    validator: 'paymentType',
    types: 'GET, POST',
    cookieValidationRequired: false,
    tasksCompleteRequired: true
  },
  PAYMENT_RESULT: {
    path: '/pay/result',
    params: ['slug?'],
    pageHeading: 'Your card payment failed',
    controller: 'payment/paymentResult',
    types: 'GET, POST',
    cookieValidationRequired: false,
    tasksCompleteRequired: true
  },
  PAYMENT_TYPE: {
    path: '/pay/type',
    view: 'payment/paymentType',
    pageHeading: 'How do you want to pay?',
    controller: 'payment/paymentType',
    validator: 'paymentType',
    types: 'GET, POST',
    tasksCompleteRequired: true
  },

  // ERRORS
  // ******
  ALREADY_SUBMITTED: {
    path: '/errors/order/done-cant-go-back',
    params: ['slug?'],
    view: 'error/alreadySubmitted',
    pageHeading: 'You have sent your application so you cannot go back and change it',
    controller: 'error/alreadySubmitted',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false,
    submittedRequired: true
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
    cookieValidationRequired: false,
    applicationRequired: false
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
  AIR_QUALITY_MANAGEMENT_AREA: {
    path: '/mcp/aqma/name',
    view: 'airQualityManagementArea',
    pageHeading: 'Is any plant or generator in an Air Quality Management Area?',
    controller: 'airQualityManagementArea',
    validator: 'airQualityManagementArea',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  AIR_DISPERSION_MODELLING_REPORT: {
    path: '/mcp/air-dispersion-modelling/upload/modelling',
    view: 'upload/mcp/airDispersionModellingReport',
    pageHeading: 'Upload the air dispersion modelling report and screening tool',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'AIR_DISPERSION_MODELLING_REPORT',
    validatorOptions: {
      fileTypes: [
        { type: 'XLS', mimeType: 'application/vnd.ms-excel' },
        { type: 'XLSX', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { type: 'ODS', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' },
        { type: 'PDF', mimeType: 'application/pdf' }
      ]
    }
  },
  APPLICATION_RECEIVED: {
    path: '/done',
    params: ['slug?'],
    view: 'applicationReceived',
    pageHeading: 'Application received',
    pageHeadingAlternate: 'Application and card payment received',
    controller: 'applicationReceived',
    types: 'GET',
    cookieValidationRequired: false,
    submittedRequired: true
  },
  APPLY_OFFLINE: {
    path: '/start/apply-offline',
    view: 'applyOffline',
    pageHeading: 'Apply for {{{chosenOption}}}',
    controller: 'applyOffline',
    types: 'GET'
  },
  BESPOKE_APPLY_OFFLINE: {
    path: '/bespoke-apply-offline',
    view: 'bespokeApplyOffline',
    pageHeading: 'Apply for a bespoke permit',
    controller: 'bespokeApplyOffline',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  BESPOKE_OR_STANDARD_RULES: {
    path: '/bespoke-or-standard-rules',
    view: 'bespokeOrStandardRules',
    pageHeading: 'Confirm the type of permit you want',
    controller: 'bespokeOrStandardRules',
    validator: 'bespokeOrStandardRules',
    nextRoute: 'PERMIT_CATEGORY',
    types: 'GET, POST',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  BEST_AVAILABLE_TECHNIQUES_ASSESSMENT: {
    path: '/mcp/best-available-techniques-assessment/upload',
    view: 'upload/mcp/bestAvailableTechniquesAssessment',
    pageHeading: 'Upload the best available techniques (BAT) assessment',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'BEST_AVAILABLE_TECHNIQUES_ASSESSMENT',
    validatorOptions: {
      fileTypes: [
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' },
        { type: 'JPG', mimeType: 'image/jpeg' }
      ]
    }
  },
  CHECK_BEFORE_SENDING: {
    path: '/check-before-sending',
    view: 'checkBeforeSending',
    pageHeading: 'Check your answers',
    controller: 'checkBeforeSending',
    nextRoute: 'PAYMENT_TYPE',
    types: 'GET, POST',
    tasksCompleteRequired: true
  },
  CHECK_YOUR_EMAIL: {
    path: '/save-return/check-your-email',
    view: 'saveAndReturn/checkYourEmail',
    pageHeading: 'Check your email',
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
    controller: 'declaration/confidentiality/confidentiality',
    validator: 'declaration/confidentiality/confidentiality',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  CONFIRM_MINING_WASTE_PLAN: {
    path: '/mining-waste/plan',
    view: 'confirmMiningWastePlan',
    pageHeading: 'Which mining waste plan will you use?',
    taskListHeading: 'Confirm mining waste plan and weight of waste',
    controller: 'confirmMiningWastePlan',
    validator: 'confirmMiningWastePlan',
    nextRoute: 'MINING_WASTE_WEIGHT',
    types: 'GET, POST'
  },
  CONFIRM_RULES: {
    path: '/confirm-rules',
    view: 'confirmRules',
    pageHeading: 'Confirm your operation meets the rules',
    controller: 'confirmRules',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  CONTACT_DETAILS: {
    path: '/contact-details',
    view: 'contactDetails',
    pageHeading: 'Who should we contact about this application?',
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
    controller: 'drainageTypeDrain',
    validator: 'drainageTypeDrain',
    types: 'GET, POST'
  },
  ENERGY_EFFICIENCY_REPORT: {
    path: '/mcp/energy-efficiency/upload',
    view: 'upload/mcp/energyEfficiencyReport',
    pageHeading: 'Upload an energy efficiency report',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'ENERGY_EFFICIENCY_REPORT',
    validatorOptions: {
      fileTypes: [
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' }
      ]
    }
  },
  ENVIRONMENTAL_RISK_ASSESSMENT: {
    path: '/environmental-risk-assessment',
    view: 'upload/environmentalRiskAssessment/environmentalRiskAssessment',
    pageHeading: 'Upload the environmental risk assessment',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'ENVIRONMENTAL_RISK_ASSESSMENT',
    validatorOptions: {
      fileTypes: [
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' }
      ]
    }
  },
  FIRE_PREVENTION_PLAN: {
    path: '/fire-prevention-plan',
    view: 'upload/firePreventionPlan/firePreventionPlan',
    pageHeading: 'Upload the fire prevention plan',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'FIRE_PREVENTION_PLAN'
  },
  HEALTH: {
    path: '/health',
    pageHeading: 'Health'
  },
  MANAGEMENT_SYSTEM_SELECT: {
    path: '/management-system/select',
    view: 'managementSystemSelect',
    pageHeading: 'Which management system will you use?',
    controller: 'managementSystemSelect',
    validator: 'managementSystemSelect',
    nextRoute: 'MANAGEMENT_SYSTEM_UPLOAD',
    types: 'GET, POST'
  },
  MANAGEMENT_SYSTEM_UPLOAD: {
    path: '/management-system/upload',
    view: 'upload/managementSystem/managementSystemSummary',
    pageHeading: 'Upload a summary of your management system',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'MANAGEMENT_SYSTEM_SUMMARY',
    validatorOptions: {
      fileTypes: [
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' }
      ]
    }
  },
  MCP_BUSINESS_ACTIVITY: {
    path: '/mcp/business-activity',
    view: 'mcpBusinessActivity',
    pageHeading: 'What is the NACE code for the main business activity that the plant or generator is used for?',
    controller: 'mcpBusinessActivity',
    validator: 'mcpBusinessActivity',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  MCP_DETAILS: {
    path: '/mcp/template/upload',
    view: 'upload/mcpDetails/mcpDetails',
    pageHeading: 'Upload the completed plant or generator list template',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'MCP_DETAILS',
    validatorOptions: {
      fileTypes: [
        { type: 'XLS', mimeType: 'application/vnd.ms-excel' },
        { type: 'XLSX', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { type: 'ODS', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' },
        { type: 'CSV', mimeType: 'text/csv' }
      ]
    }
  },
  MCP_UNDER_500_HOURS: {
    path: '/mcp-check/under-500-hours',
    view: 'operatingUnder500Hours',
    pageHeading: 'Will your MCP operate for less than 500 hours a year?',
    controller: 'operatingUnder500Hours',
    validator: 'operatingUnder500Hours',
    nextRoute: 'MCP_AIR_DISPERSION_MODELLING',
    types: 'GET, POST'
  },
  MCP_AIR_DISPERSION_MODELLING: {
    path: '/mcp-check/air-dispersion-modelling-report',
    view: 'airDispersionModelling',
    pageHeading: 'Do you need to provide an air dispersion modelling report?',
    controller: 'airDispersionModelling',
    validator: 'airDispersionModelling',
    nextRoute: 'MCP_REQUIRES_ENERGY_REPORT',
    types: 'GET, POST'
  },
  MCP_EXISTING_PERMIT: {
    path: '/existing-permit',
    view: 'existingPermit',
    pageHeading: 'Does your site or installation already have an environmental (EPR) permit?',
    controller: 'existingPermit',
    validator: 'existingPermit',
    types: 'GET, POST'
  },
  MCP_HABITAT_ASSESSMENT: {
    path: '/mcp-check/habitat-assessment',
    view: 'habitatAssessment',
    pageHeading: 'Do you need a habitat assessment?',
    controller: 'habitatAssessment',
    validator: 'habitatAssessment',
    nextRoute: 'CREATE_APPLICATION_LINES',
    types: 'GET, POST'
  },
  MCP_HAS_EXISTING_PERMIT: {
    path: '/existing-permit/yes',
    view: 'contactUsBefore',
    pageHeading: 'Contact us before you apply',
    controller: 'staticPage',
    types: 'GET'
  },
  MCP_NACE_CODE_LIST: {
    path: '/information/nace-codes',
    view: 'naceCodeList',
    pageHeading: 'List of NACE codes for medium combustion plant and specified generators',
    controller: 'staticPage',
    types: 'GET',
    cookieValidationRequired: false,
    applicationRequired: false
  },
  MCP_TEMPLATE: {
    path: '/mcp/template/download',
    view: 'mcpTemplate',
    pageHeading: 'Download and complete the plant or generator list template',
    controller: 'mcpTemplate',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  MCP_REQUIRES_BEST_AVAILABLE_TECHNIQUES_SG: {
    path: '/mcp-check/best-available-techniques/sg',
    view: 'mcpBestAvailableTechniquesRequiredSg',
    pageHeading: 'Does any single generator unit have a rated thermal input between 20MW and 50MW?',
    controller: 'mcpBestAvailableTechniquesRequiredSg',
    validator: 'mcpBestAvailableTechniquesRequiredSg',
    nextRoute: 'MCP_REQUIRES_BEST_AVAILABLE_TECHNIQUES_MCP',
    types: 'GET, POST'
  },
  MCP_REQUIRES_BEST_AVAILABLE_TECHNIQUES_MCP: {
    path: '/mcp-check/best-available-techniques/mcp',
    view: 'mcpBestAvailableTechniquesRequiredMcp',
    pageHeading: 'Are you burning waste biomass?',
    controller: 'mcpBestAvailableTechniquesRequiredMcp',
    validator: 'mcpBestAvailableTechniquesRequiredMcp',
    nextRoute: 'MCP_HABITAT_ASSESSMENT',
    types: 'GET, POST'
  },
  MCP_REQUIRES_ENERGY_REPORT: {
    path: '/mcp-check/energy-report',
    view: 'mcpEnergyReportRequired',
    pageHeading: 'Do you need to provide an energy efficiency report?',
    controller: 'mcpEnergyReportRequired',
    validator: 'mcpEnergyReportRequired',
    nextRoute: 'MCP_REQUIRES_BEST_AVAILABLE_TECHNIQUES_SG',
    types: 'GET, POST'
  },
  MINING_WASTE_WEIGHT: {
    path: '/mining-waste/weight',
    view: 'miningWasteWeight',
    pageHeading: 'How much extractive waste will you produce?',
    controller: 'miningWasteWeight',
    validator: 'miningWasteWeight',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  NEED_TO_CONSULT: {
    path: '/consultation/names',
    view: 'needToConsult',
    pageHeading: 'Will the operation release any substance into a sewer, harbour or coastal or territorial waters?',
    controller: 'needToConsult',
    validator: 'needToConsult',
    nextRoute: 'TASK_LIST',
    types: 'GET, POST'
  },
  NON_TECHNICAL_SUMMARY: {
    path: '/non-technical-summary',
    view: 'upload/nonTechnicalSummary/nonTechnicalSummary',
    pageHeading: 'Upload a non-technical summary',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'NON_TECHNICAL_SUMMARY',
    validatorOptions: {
      fileTypes: [
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' }
      ]
    }
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
    path: '/r',
    params: ['slug?'],
    view: 'saveAndReturn/recover',
    pageHeading: 'We found your application',
    controller: 'saveAndReturn/recover',
    types: 'GET, POST',
    cookieValidationRequired: false
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
    controller: 'saveAndReturn/enterEmail',
    validator: 'saveAndReturn',
    types: 'GET, POST'
  },
  SCREENING_TOOL: {
    path: '/mcp/air-dispersion-modelling/upload/screening-only',
    view: 'upload/mcp/screeningTool',
    pageHeading: 'Upload the completed screening tool',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'AIR_DISPERSION_MODELLING_REPORT',
    validatorOptions: {
      fileTypes: [
        { type: 'XLS', mimeType: 'application/vnd.ms-excel' },
        { type: 'XLSX', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { type: 'ODS', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' },
        { type: 'PDF', mimeType: 'application/pdf' }
      ]
    }
  },
  SEARCH_YOUR_EMAIL: {
    path: '/save-return/search-your-email',
    view: 'saveAndReturn/checkYourEmail',
    pageHeading: 'Search for ’standard rules permit application’ in your emails',
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
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'SITE_PLAN'
  },
  SITE_NAME: {
    path: '/site/site-name',
    view: 'siteName',
    pageHeading: 'What is the site name?',
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
    pageHeading: 'Apply for a {{permitType}} environmental permit',
    controller: 'taskList',
    validator: 'taskList',
    types: 'GET, POST'
  },
  TECHNICAL_QUALIFICATION: {
    path: '/technical-competence',
    view: 'technicalQualification',
    pageHeading: 'What evidence of technical competence do you have?',
    controller: 'technicalQualification',
    validator: 'technicalQualification',
    types: 'GET, POST'
  },
  TECHNICAL_MANAGERS: {
    path: '/technical-competence/technical-managers',
    view: 'upload/technicalQualification/technicalManagers',
    pageHeading: 'Upload details for all technically competent managers',
    controller: 'technicalManagers',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'TECHNICAL_MANAGERS',
    validatorOptions: {
      fileTypes: [
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' }
      ]
    }
  },
  UPLOAD_COURSE_REGISTRATION: {
    path: '/technical-competence/upload-course-registration',
    view: 'upload/technicalQualification/courseRegistration',
    pageHeading: 'Getting a qualification: upload your evidence',
    controller: 'courseRegistration',
    validator: 'upload',
    nextRoute: 'TECHNICAL_MANAGERS',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'TECHNICAL_QUALIFICATION'
  },
  UPLOAD_DEEMED_EVIDENCE: {
    path: '/technical-competence/upload-deemed-evidence',
    view: 'upload/technicalQualification/deemedEvidence',
    pageHeading: 'Deemed competence or an assessment: upload your evidence',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TECHNICAL_MANAGERS',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'TECHNICAL_QUALIFICATION'
  },
  UPLOAD_ESA_EU_SKILLS: {
    path: '/technical-competence/upload-esa-eu-skills',
    view: 'upload/technicalQualification/esaEuSkills',
    pageHeading: 'Energy & Utility Skills / ESA: upload your evidence',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'TECHNICAL_QUALIFICATION'
  },
  UPLOAD_WAMITAB_QUALIFICATION: {
    path: '/technical-competence/upload-wamitab-qualification',
    view: 'upload/technicalQualification/wamitabQualification',
    pageHeading: 'WAMITAB or EPOC: upload your evidence',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TECHNICAL_MANAGERS',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'TECHNICAL_QUALIFICATION'
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
  WASTE_RECOVERY_PLAN_APPROVAL: {
    path: '/waste-recovery-plan/approval',
    view: 'wasteRecoveryPlanApproval',
    pageHeading: 'You need to upload your waste recovery plan',
    controller: 'wasteRecoveryPlanApproval',
    validator: 'wasteRecoveryPlanApproval',
    nextRoute: 'WASTE_RECOVERY_PLAN',
    types: 'GET, POST'
  },
  WASTE_RECOVERY_PLAN: {
    path: '/waste-recovery-plan',
    view: 'upload/wasteRecoveryPlan/wasteRecoveryPlan',
    pageHeading: 'Upload the waste recovery plan',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'WASTE_RECOVERY_PLAN',
    validatorOptions: {
      fileTypes: [
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' }
      ]
    }
  },
  WASTE_TYPES_LIST: {
    path: '/waste-codes',
    view: 'upload/wasteTypesList/wasteTypesList',
    pageHeading: 'Upload a document that lists the types of waste you want to accept',
    controller: 'upload',
    validator: 'upload',
    nextRoute: 'TASK_LIST',
    types: 'GET, REMOVE, UPLOAD',
    baseRoute: 'uploadRoute',
    subject: 'WASTE_TYPES_LIST',
    validatorOptions: {
      fileTypes: [
        { type: 'PDF', mimeType: 'application/pdf' },
        { type: 'DOC', mimeType: 'application/msword' },
        { type: 'DOCX', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { type: 'XLS', mimeType: 'application/vnd.ms-excel' },
        { type: 'XLSX', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { type: 'ODT', mimeType: 'application/vnd.oasis.opendocument.text' },
        { type: 'ODS', mimeType: 'application/vnd.oasis.opendocument.spreadsheet' }
      ]
    }
  }
}

module.exports = Routes
