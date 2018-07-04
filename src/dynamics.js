const Features = require('./config/featureConfig')

const Dynamics = {
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
      canApplyOnline: Features.hasLLPFeature, // ToDo This has been implemented so will work when this is set to true
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

module.exports = Dynamics
