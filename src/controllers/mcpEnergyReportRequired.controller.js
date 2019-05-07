'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MOBILE_SG, STATIONARY_SG } = require('../dynamics').MCP_TYPES

module.exports = class EnergyReportRequiredController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)

    switch (taskDeterminants.mcpType) {
      case MOBILE_SG:
      case STATIONARY_SG:
        await taskDeterminants.save({ energyEfficiencyReportRequired: false })
        return this.redirect({ h })
    }

    if (request.payload) {
      pageContext.newOrRefurbished = request.payload['new-or-refurbished'] === 'yes'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const energyEfficiencyReportRequired = request.payload['new-or-refurbished'] === 'yes'

    await taskDeterminants.save({ energyEfficiencyReportRequired })
    return this.redirect({ h })
  }
}
