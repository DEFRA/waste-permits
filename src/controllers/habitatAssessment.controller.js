'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MOBILE_SG, MOBILE_SG_AND_MCP } = require('../dynamics').MCP_TYPES

module.exports = class HabitatAssessmentController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context
    switch (taskDeterminants.mcpType) {
      case MOBILE_SG:
      case MOBILE_SG_AND_MCP:
      // Set the habitatAssessmentRequired to false and redirect to the next page
        await taskDeterminants.save({ habitatAssessmentRequired: false })
        return this.redirect({ h })
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Store the true/false answer and redirect to the next page
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const habitatAssessmentRequired = request.payload['habitat-assessment'] === 'yes'
    await taskDeterminants.save({ habitatAssessmentRequired })

    return this.redirect({ h })
  }
}
