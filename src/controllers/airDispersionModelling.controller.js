'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { STATIONARY_MCP, MOBILE_SG, MOBILE_SG_AND_MCP } = require('../dynamics').MCP_TYPES

module.exports = class AirDispersionModellingController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    switch (taskDeterminants.mcpType) {
      case MOBILE_SG:
      case MOBILE_SG_AND_MCP:
        // Set the airDispersionModellingRequired to false and redirect to the next page
        await taskDeterminants.save({ airDispersionModellingRequired: false })
        return this.redirect({ h })
      case STATIONARY_MCP:
        pageContext.isStationaryMCP = true
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const airDispersionModellingRequired = request.payload['air-dispersion-modelling'] === 'yes'
    await taskDeterminants.save({ airDispersionModellingRequired })

    return this.redirect({ h })
  }
}
