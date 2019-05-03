'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { STATIONARY_MCP, STATIONARY_SG } = require('../dynamics').MCP_TYPES
const { THERMAL_INPUT_20MW_TO_50MW } = require('../routes')

module.exports = class AirDispersionModellingController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    if (taskDeterminants.mcpType === STATIONARY_MCP) {
      pageContext.isStationaryMCP = true
    }

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

    return this.redirect({ h })
  }
}
