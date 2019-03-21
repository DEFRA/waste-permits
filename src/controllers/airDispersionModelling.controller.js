'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const { MCP_TYPES: { STATIONARY_MCP, MOBILE_SG } } = require('../models/triage/triageLists')

module.exports = class AirDispersionModellingController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    // TODO: Not sure yet whether to show the page or not to MOBILE_SG_AND_MCP
    const context = await RecoveryService.createApplicationContext(h)
    const { data: { mcpType } } = await DataStore.get(context)
    if (mcpType === STATIONARY_MCP.id || mcpType === MOBILE_SG.id) {
      // Set the airDispersionModellingRequired to false and redirect to the next page
      await DataStore.save(context, { airDispersionModellingRequired: false })
      return this.redirect({ h })
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
