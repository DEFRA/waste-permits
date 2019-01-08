const { VEHICLE_DISMANTLING_LESS_THAN_75000_TONS } = require('./constants').PermitTypes.STANDARD_RULES

const Dynamics = {
  AccountRoleCodes: {
    COMPANY_DIRECTOR: 910400000,
    LLP_DESIGNATED_MEMBER: 910400001,
    LLP_MEMBER: 910400002
  },
  AccountTypes: {
    AGENT: 910400000
  },
  AddressTypes: {
    PUBLIC_BODY_MAIN_ADDRESS: {
      TYPE: 910400001,
      NAME: 'Public body main address'
    },
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
    COMPANY_REGISTERED_ADDRESS: {
      TYPE: 910400005,
      NAME: 'Company Registered Address'
    },
    PRIMARY_CONTACT_DETAILS: {
      TYPE: 910400007,
      NAME: 'Primary Contact Details'
    },
    DESIGNATED_MEMBER_CONTACT_DETAILS: {
      TYPE: 910400008,
      NAME: 'Designated Member Email Address'
    },
    PARTNER_CONTACT_DETAILS: {
      TYPE: 910400009,
      NAME: 'Partner contact details'
    },
    RESPONSIBLE_CONTACT_DETAILS: {
      TYPE: 910400010,
      NAME: 'Responsible contact details'
    },
    DIRECTOR_CONTACT_DETAILS: {
      TYPE: 910400011,
      NAME: 'Director contact details'
    }
  },
  ApplicationQuestions: {
    CHARITY_DETAILS: {
      NAME: {
        questionCode: 'general-charity-name'
      },
      NUMBER: {
        questionCode: 'general-charity-number'
      }
    },
    MANAGEMENT_SYSTEM: {
      questionCode: 'environmental-management-system',
      answers: [
        {
          id: 'eco-management',
          description: 'Eco-Management and Audit Scheme ({{{EMAS}}})',
          plainText: 'Eco-Management and Audit Scheme (EMAS)'
        }, {
          id: 'ems-easy',
          description: '{{{EMAS}}} Easy',
          plainText: 'EMAS Easy'
        }, {
          id: 'iso-14001-2015',
          description: '{{{ISO}}} 14001:2015 environmental management system standard',
          plainText: 'ISO 14001:2015 environmental management system standard'
        }, {
          id: 'bs-8555',
          description: 'British Standard BS 8555 phases 1 to 5'
        }, {
          id: 'green-dragon',
          description: 'Green Dragon'
        }, {
          id: 'own-management-system',
          description: 'Your own management system',
          hint: 'If you use your own system, it must meet the standards in our guidance'
        }
      ]
    }
  },
  BACS_EMAIL_CONFIG: 'PSC-BACS-EMAIL',
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
      exceptions: [VEHICLE_DISMANTLING_LESS_THAN_75000_TONS]
    },
    WATERCOURSE: {
      id: 'watercourse',
      type: 910400003,
      description: 'Surface water drains, a watercourse, the ground or a water body',
      allowed: false
    }
  },
  MiningWastePlans: {
    WATER_BASED: {
      id: 'water-based',
      type: 910400000,
      description: 'Water-based drilling mud mining waste management plan (WMP1)'
    },
    WATER_AND_OIL_BASED: {
      id: 'water-and-oil-based',
      type: 910400001,
      description: 'Oil- and water-based drilling mud mining waste management plan (WMP2)'
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
    PUBLIC_BODY: {
      id: 'public-body',
      type: 'Local authority or public body',
      canApplyOnline: true,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400002
    },
    PARTNERSHIP: {
      id: 'partnership',
      type: 'Partnership',
      canApplyOnline: true,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400003
    },
    CHARITY_OR_TRUST: {
      id: 'charity-or-trust',
      type: 'Charity or trust',
      canApplyOnline: true,
      dynamicsApplicantTypeId: 910400001,
      dynamicsOrganisationTypeId: 910400004
    },
    LIMITED_LIABILITY_PARTNERSHIP: {
      id: 'limited-liability-partnership',
      type: 'Limited liability partnership',
      canApplyOnline: true,
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
  RecoveryPlanAssessmentStatus: {
    ALREADY_ASSESSED: {
      TYPE: 910400000,
      DESCRIPTION: 'plan agreed and there are no changes'
    },
    PLAN_HAS_CHANGED: {
      TYPE: 910400001,
      DESCRIPTION: 'plan assessed but the plan has changed'
    },
    NOT_ASSESSED: {
      TYPE: 910400002,
      DESCRIPTION: 'plan not assessed before'
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
  WASTE_REGIME: 910400000
}

module.exports = Dynamics
