const PERMIT_TYPES = {
  STANDARD_RULES: {
    id: 'standard-rules',
    key: '1',
    text: 'Standard rules',
    canApplyOnline: true
  },
  BESPOKE: {
    id: 'bespoke',
    key: '2',
    text: 'Bespoke',
    canApplyOnline: true
  }
}

const PERMIT_TYPE_LIST = [PERMIT_TYPES.STANDARD_RULES, PERMIT_TYPES.BESPOKE]

const PERMIT_HOLDER_TYPES = {
  LIMITED_COMPANY: {
    id: 'limited-company',
    key: '01',
    text: 'Limited company',
    canApplyOnline: true
  },
  SOLE_TRADER: {
    id: 'sole-trader',
    key: '02',
    text: 'Sole trader',
    canApplyOnline: true
  },
  INDIVIDUAL: {
    id: 'individual',
    key: '03',
    text: 'Individual',
    canApplyOnline: true
  },
  PUBLIC_BODY: {
    id: 'public-body',
    key: '04',
    text: 'Local authority or public body',
    canApplyOnline: true
  },
  PARTNERSHIP: {
    id: 'partnership',
    key: '05',
    text: 'Partnership',
    canApplyOnline: true
  },
  CHARITY_OR_TRUST: {
    id: 'charity-or-trust',
    key: '06',
    text: 'Registered charity',
    canApplyOnline: false
  },
  LIMITED_LIABILITY_PARTNERSHIP: {
    id: 'limited-liability-partnership',
    key: '07',
    text: 'Limited liability partnership',
    canApplyOnline: true
  },
  OTHER_ORGANISATION: {
    id: 'other-organisation',
    key: '90',
    text: 'Other organisation, for example a club or association',
    canApplyOnline: false
  }
}

const PERMIT_HOLDER_TYPE_LIST = [
  PERMIT_HOLDER_TYPES.LIMITED_COMPANY,
  PERMIT_HOLDER_TYPES.SOLE_TRADER,
  PERMIT_HOLDER_TYPES.INDIVIDUAL,
  PERMIT_HOLDER_TYPES.PUBLIC_BODY,
  PERMIT_HOLDER_TYPES.PARTNERSHIP,
  PERMIT_HOLDER_TYPES.CHARITY_OR_TRUST,
  PERMIT_HOLDER_TYPES.LIMITED_LIABILITY_PARTNERSHIP,
  PERMIT_HOLDER_TYPES.OTHER_ORGANISATION
]

const FACILITY_TYPES = {
  INSTALLATION: {
    id: 'installation',
    key: '01',
    text: 'Installation',
    description: 'Facilities which carry out industrial processes like refineries, food and drink factories and intensive farming activities',
    typeText: 'installations',
    canApplyOnline: false
  },
  WASTE_OPERATION: {
    id: 'waste',
    key: '02',
    text: 'Waste operation',
    description: 'For example, transfer stations, waste treatment, recycling and composting',
    typeText: 'waste operations',
    canApplyOnline: true
  },
  MINING_WASTE_OPERATION: {
    id: 'mining',
    key: '03',
    text: 'Mining waste operation',
    typeText: 'mining waste operations',
    canApplyOnline: false
  },
  WATER_DISCHARGE: {
    id: 'discharge',
    key: '04',
    text: 'Water discharge',
    description: 'For example, sewage, industrial or trade discharge, clearing water channels',
    typeText: 'water discharges',
    canApplyOnline: false
  },
  GROUNDWATER: {
    id: 'groundwater',
    key: '05',
    text: 'Groundwater activity',
    typeText: 'groundwater activities',
    canApplyOnline: false
  },
  MCP: {
    id: 'mcp',
    key: '06',
    text: 'Medium combustion plant or specified generator',
    typeText: 'medium combustion plant or specified generator',
    canApplyOnline: true
  },
  LANDFILL: {
    id: 'landfill',
    key: '07',
    text: 'Landfill and deposit for recovery',
    typeText: 'landfill and deposit for recovery',
    canApplyOnline: false
  }
}

const FACILITY_TYPE_LIST = [
  FACILITY_TYPES.INSTALLATION,
  FACILITY_TYPES.WASTE_OPERATION,
  FACILITY_TYPES.LANDFILL,
  FACILITY_TYPES.MCP,
  FACILITY_TYPES.MINING_WASTE_OPERATION,
  FACILITY_TYPES.WATER_DISCHARGE,
  FACILITY_TYPES.GROUNDWATER
]

const MCP_TYPES = {
  STATIONARY_MCP: {
    id: 'stationary-mcp',
    key: '01',
    text: 'Stationary medium combustion plant (MCP)',
    isMobile: false,
    canApplyOnline: true
  },
  STATIONARY_SG: {
    id: 'stationary-sg',
    key: '02',
    text: 'Stationary specified generator (SG)',
    isMobile: false,
    canApplyOnline: true
  },
  STATIONARY_MCP_AND_SG: {
    id: 'stationary-mcp-sg',
    key: '03',
    text: 'Stationary MCP which is also an SG',
    isMobile: false,
    canApplyOnline: true
  },
  MOBILE_SG: {
    id: 'mobile-sg',
    key: '04',
    text: 'Mobile SG',
    isMobile: true,
    canApplyOnline: true
  },
  MOBILE_SG_AND_MCP: {
    id: 'mobile-sg-mcp',
    key: '05',
    text: 'Mobile SG which is also an MCP',
    isMobile: true,
    canApplyOnline: true
  }
}
const MCP_TYPE_LIST = [
  MCP_TYPES.STATIONARY_MCP,
  MCP_TYPES.STATIONARY_SG,
  MCP_TYPES.STATIONARY_MCP_AND_SG,
  MCP_TYPES.MOBILE_SG,
  MCP_TYPES.MOBILE_SG_AND_MCP
]

module.exports = {
  PERMIT_TYPES,
  PERMIT_TYPE_LIST,
  PERMIT_HOLDER_TYPES,
  PERMIT_HOLDER_TYPE_LIST,
  FACILITY_TYPE_LIST,
  MCP_TYPE_LIST
}
