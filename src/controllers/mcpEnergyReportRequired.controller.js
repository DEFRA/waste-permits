'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { STATIONARY_MCP, MOBILE_MCP } = require('../dynamics').MCP_TYPES
const { BURNING_WASTE_BIOMASS, CONFIRM_COST } = require('../routes')

module.exports = class EnergyReportRequiredController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.newOrRefurbished = request.payload['new-or-refurbished'] === 'yes'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const energyEfficiencyReportRequired = request.payload['new-or-refurbished'] === 'yes'

    await taskDeterminants.save({
      bestAvailableTechniquesAssessment: false,
      habitatAssessmentRequired: false,
      energyEfficiencyReportRequired
    })

    switch (taskDeterminants.mcpType) {
      case STATIONARY_MCP:
        return this.redirect({ h, route: BURNING_WASTE_BIOMASS })
      case MOBILE_MCP:
        return this.redirect({ h, route: CONFIRM_COST })
    }

    return this.redirect({ h })
  }
}
