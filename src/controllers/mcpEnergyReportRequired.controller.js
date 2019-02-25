'use strict'

const DataStore = require('../models/dataStore.model')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class EnergyEfficiencyReportController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const dataStore = await DataStore.get(context)

    // TODO: Confirm if we need to redirect on mobile SG which is also MCP
    if (dataStore.data.mcpType === 'mobile-sg') {
      return this.redirect({ h })
    }

    if (request.payload) {
      pageContext.newOrRefurbished = request.payload['new-or-refurbished'] === 'yes'
      pageContext.notNewOrRefurbished = request.payload['new-or-refurbished'] === 'no'
      pageContext.thermalInputUnder20 = request.payload['total-aggregated-thermal-input'] === 'under 20'
      pageContext.thermalInputOver20 = request.payload['total-aggregated-thermal-input'] === 'over 20'
      pageContext.boiler = request.payload['engine-type'] === 'boiler etc'
      pageContext.sparkIgnition = request.payload['engine-type'] === 'spark ignition'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const energyEfficiencyReportRequired = request.payload['new-or-refurbished'] === 'yes' &&
                                           request.payload['total-aggregated-thermal-input'] === 'over 20' &&
                                           request.payload['engine-type'] === 'boiler etc'

    await DataStore.save(context, { energyEfficiencyReportRequired })
    return this.redirect({ h })
  }
}
