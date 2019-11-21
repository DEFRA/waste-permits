
'use strict'

const BaseController = require('./base.controller')
const featureConfig = require('../config/featureConfig')
const RecoveryService = require('../services/recovery.service')
const { BUSINESS_TRACKS, FACILITY_TYPES, FACILITY_TYPES: { MCP, WASTE_OPERATION }, REGIMES } = require('../dynamics')
const { FACILITY_APPLY_OFFLINE, MCP_TYPE, WASTE_ACTIVITY } = require('../routes')

module.exports = class FacilityTypeController extends BaseController {
  async setRegimeAndBusinessTrack ({ context, regime, businessTrack }) {
    const { application } = context
    application.regime = regime
    application.businessTrack = businessTrack
    await application.save(context)
  }

  async doGet (request, h, errors) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const { facilityType } = taskDeterminants
    const pageContext = this.createPageContext(h, errors)

    pageContext.facilityTypes = Object.values(FACILITY_TYPES)
      .map((type) => Object.assign({ selected: type === facilityType }, type))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context
    const { 'facility-type': facilityType } = request.payload

    await taskDeterminants.save({ facilityType })

    switch (facilityType) {
      case MCP.id:
        await this.setRegimeAndBusinessTrack({
          context,
          regime: REGIMES.MCP.dynamicsGuid,
          businessTrack: BUSINESS_TRACKS.MCP_BESPOKE.dynamicsGuid
        })
        return this.redirect({ h, route: MCP_TYPE })

      case WASTE_OPERATION.id:
        // Todo: Remove this redirect when Bespoke is live
        if (!featureConfig.hasBespokeFeature) {
          return this.redirect({ h, route: FACILITY_APPLY_OFFLINE })
        }
        await this.setRegimeAndBusinessTrack({
          context,
          regime: REGIMES.WASTE.dynamicsGuid,
          businessTrack: BUSINESS_TRACKS.WASTE_BESPOKE.dynamicsGuid
        })
        return this.redirect({ h, route: WASTE_ACTIVITY })

      default:
        return this.redirect({ h, route: FACILITY_APPLY_OFFLINE })
    }
  }
}
