'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { STATIONARY_SG, STATIONARY_MCP, MOBILE_MCP, MOBILE_SG } = require('../dynamics').MCP_TYPES
const { THERMAL_INPUT_20MW_TO_50MW, MAINTAIN_APPLICATION_LINES } = require('../routes')

module.exports = class AirDispersionModellingController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    // display mcpText block if permit is for stationary MCP or mobile MCP
    pageContext.mcpText = [STATIONARY_MCP, MOBILE_MCP].includes(taskDeterminants.mcpType)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const airDispersionModellingRequired = request.payload['air-dispersion-modelling'] === 'yes'
    await taskDeterminants.save({
      energyEfficiencyReportRequired: false,
      bestAvailableTechniquesAssessment: false,
      habitatAssessmentRequired: false,
      airDispersionModellingRequired,
      screeningToolRequired: !airDispersionModellingRequired
    })

    if (taskDeterminants.mcpType === STATIONARY_SG) {
      return this.redirect({ h, route: THERMAL_INPUT_20MW_TO_50MW })
    }

    if (taskDeterminants.mcpType === MOBILE_SG) {
      return this.redirect({ h, route: MAINTAIN_APPLICATION_LINES })
    }

    return this.redirect({ h })
  }
}
