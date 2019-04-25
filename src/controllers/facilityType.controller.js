
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { FACILITY_TYPES } = require('../dynamics')
const { MCP, WASTE_OPERATION } = FACILITY_TYPES
const { FACILITY_APPLY_OFFLINE, MCP_TYPE, WASTE_ACTIVITY } = require('../routes')

module.exports = class FacilityTypeController extends BaseController {
  async doGet (request, h, errors) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const { facilityType } = taskDeterminants
    const pageContext = this.createPageContext(h, errors)

    pageContext.facilityTypes = Object.values(FACILITY_TYPES).map((type) => Object.assign({ selected: type === facilityType }, type))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const { 'facility-type': facilityType } = request.payload

    await taskDeterminants.save({ facilityType })

    switch (facilityType) {
      case MCP.id:
        return this.redirect({ h, route: MCP_TYPE })
      case WASTE_OPERATION.id:
        return this.redirect({ h, route: WASTE_ACTIVITY })
      default:
        return this.redirect({ h, route: FACILITY_APPLY_OFFLINE })
    }
  }
}
