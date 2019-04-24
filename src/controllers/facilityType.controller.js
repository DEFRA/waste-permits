
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const FacilityType = require('../models/facilityType.model')
const { FACILITY_TYPES } = require('../dynamics')
const { MCP, WASTE_OPERATION } = FACILITY_TYPES
const { FACILITY_APPLY_OFFLINE, MCP_TYPE, WASTE_ACTIVITY } = require('../routes')

const facilityTypes = Object.values(FACILITY_TYPES)

module.exports = class FacilityTypeController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { facilityType = {} } = context
    const { id: facilityTypeId } = facilityType
    const pageContext = this.createPageContext(h, errors)

    pageContext.facilityTypes = facilityTypes.map((facilityType) => Object.assign(facilityType, { isSelected: facilityType.id === facilityTypeId }))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { 'facility-type': facilityTypeId } = request.payload

    const facilityType = context.facilityType || new FacilityType()
    facilityType.id = facilityTypeId
    await facilityType.save(context)

    switch (facilityType.id) {
      case MCP.id:
        return this.redirect({ h, route: MCP_TYPE })
      case WASTE_OPERATION.id:
        return this.redirect({ h, route: WASTE_ACTIVITY })
      default:
        return this.redirect({ h, route: FACILITY_APPLY_OFFLINE })
    }
  }
}
