'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MCP_HABITAT_ASSESSMENT, MCP_HAS_EXISTING_PERMIT, MCP_UNDER_500_HOURS, TASK_LIST } = require('../routes')
const { STATIONARY_SG } = require('../dynamics').MCP_TYPES

module.exports = class ExistingPermitController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)

    // Clear task determinants
    await taskDeterminants.save({
      bestAvailableTechniquesAssessment: false,
      airDispersionModellingRequired: false,
      screeningToolRequired: false,
      habitatAssessmentRequired: false,
      energyEfficiencyReportRequired: false
    })

    const { 'existing-permit': existingPermit } = request.payload

    if (existingPermit === 'yes') {
      return this.redirect({ h, route: MCP_HAS_EXISTING_PERMIT })
    }

    const { isBespoke, taskDeterminants: { mcpType } } = await RecoveryService.createApplicationContext(h)
    if (isBespoke) {
      if (mcpType === STATIONARY_SG) {
        return this.redirect({ h, route: MCP_HABITAT_ASSESSMENT })
      } else {
        return this.redirect({ h, route: MCP_UNDER_500_HOURS })
      }
    } else {
      return this.redirect({ h, route: TASK_LIST })
    }
  }
}
