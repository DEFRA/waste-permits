'use strict'

const BaseController = require('./base.controller')
const Routes = require('../routes')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const { MCP_TYPES: {
  STATIONARY_SG,
  MOBILE_SG,
  MOBILE_SG_AND_MCP
} } = require('../models/triage/triageLists')

module.exports = class OperatingUnder500HoursController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    const context = await RecoveryService.createApplicationContext(h)
    const { data: { mcpType } } = await DataStore.get(context)
    if (mcpType === STATIONARY_SG.id ||
      mcpType === MOBILE_SG.id ||
      mcpType === MOBILE_SG_AND_MCP.id) {
      return this.redirect({ h })
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    if (request.payload['operating-under-500-hours'] === 'yes') {
      await DataStore.save(context, {
        airDispersionModellingRequired: false,
        energyEfficiencyReportRequired: false,
        bestAvailableTechniquesAssessment: false,
        habitatAssessmentRequired: false
      })
      return this.redirect({ h, route: Routes.CREATE_APPLICATION_LINES }) // TODO: Be aware this should jump to the CONFIRM_COSTS page, but for now goes to our temporary CREATE_APPLICATION_LINES route (which creates the lines and jumps to the CONFIRM_COSTS page)
    } else {
      return this.redirect({ h })
    }
  }
}
