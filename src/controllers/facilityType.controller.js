
'use strict'

const BaseController = require('./base.controller')
const { FACILITY_TYPES } = require('../dynamics')
const { FACILITY_APPLY_OFFLINE, MCP_TYPE, TRIAGE_FACILITY } = require('../routes')

const facilityTypes = Object.keys(FACILITY_TYPES).map((facilityType) => FACILITY_TYPES[facilityType])

module.exports = class FacilityTypeController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.facilityTypes = facilityTypes

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { 'facility-type': facilityTypeId } = request.payload

    const facilityType = facilityTypes.find(({ id, canApplyOnline }) => canApplyOnline && id === facilityTypeId)

    switch (facilityType) {
      case FACILITY_TYPES.MCP:
        return this.redirect({ h, route: MCP_TYPE })
      case FACILITY_TYPES.WASTE_OPERATION:
        return this.redirect({ h, route: TRIAGE_FACILITY, params: ['bespoke', facilityTypeId] })
      default:
        return this.redirect({ h, route: FACILITY_APPLY_OFFLINE, params: ['bespoke', facilityTypeId] })
    }
  }
}
