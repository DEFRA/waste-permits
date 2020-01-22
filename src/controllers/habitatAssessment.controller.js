'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { STATIONARY_MCP } = require('../dynamics').MCP_TYPES
const { MCP_REQUIRES_ENERGY_REPORT } = require('../routes')

module.exports = class HabitatAssessmentController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Store the true/false answer and redirect to the next page
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const habitatAssessmentRequired = request.payload['habitat-assessment'] === 'yes'
    await taskDeterminants.save({ habitatAssessmentRequired })

    if (taskDeterminants.mcpType === STATIONARY_MCP && !habitatAssessmentRequired) {
      await taskDeterminants.save({
        airDispersionModellingRequired: false,
        screeningToolRequired: true
      })
      return this.redirect({ h, route: MCP_REQUIRES_ENERGY_REPORT })
    }

    return this.redirect({ h })
  }
}
