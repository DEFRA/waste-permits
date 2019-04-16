'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const { STATIONARY_MCP, MOBILE_SG, MOBILE_SG_AND_MCP } = require('../dynamics').MCP_TYPES

module.exports = class AirDispersionModellingController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    // TODO: Not sure yet whether to show the page or not to MOBILE_SG_AND_MCP
    const context = await RecoveryService.createApplicationContext(h)
    const { mcpType = {} } = context
    switch (mcpType.id) {
      case MOBILE_SG.id:
      case MOBILE_SG_AND_MCP.id:
        // Set the airDispersionModellingRequired to false and redirect to the next page
        await DataStore.save(context, { airDispersionModellingRequired: false })
        return this.redirect({ h })
      case STATIONARY_MCP.id:
        pageContext.isStationaryMCP = true
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const airDispersionModellingRequired = request.payload['air-dispersion-modelling'] === 'yes'
    await DataStore.save(context, { airDispersionModellingRequired: airDispersionModellingRequired })

    return this.redirect({ h })
  }
}
