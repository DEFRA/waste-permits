'use strict'

const DataStore = require('../models/dataStore.model')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MCP_TYPES: { MOBILE_SG, STATIONARY_SG } } = require('../models/triage/triageLists')

module.exports = class EnergyReportRequiredController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const dataStore = await DataStore.get(context)

    if (
      dataStore.data.mcpType === MOBILE_SG.id ||
      dataStore.data.mcpType === STATIONARY_SG.id
    ) {
      await DataStore.save(context, { energyEfficiencyReportRequired: false })
      return this.redirect({ h })
    }

    if (request.payload) {
      pageContext.newOrRefurbished = request.payload['new-or-refurbished'] === 'yes'
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
