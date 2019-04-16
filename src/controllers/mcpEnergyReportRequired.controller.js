'use strict'

const DataStore = require('../models/dataStore.model')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MOBILE_SG, STATIONARY_SG } = require('../dynamics').MCP_TYPES

module.exports = class EnergyReportRequiredController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    switch (context.mcpType.id) {
      case MOBILE_SG.id:
      case STATIONARY_SG.id:
        await DataStore.save(context, { energyEfficiencyReportRequired: false })
        return this.redirect({ h })
    }

    if (request.payload) {
      pageContext.newOrRefurbished = request.payload['new-or-refurbished'] === 'yes'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const energyEfficiencyReportRequired = request.payload['new-or-refurbished'] === 'yes'

    await DataStore.save(context, { energyEfficiencyReportRequired })
    return this.redirect({ h })
  }
}
