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
        airDispersionModelling: 'no',
        energyEfficiencyReportRequired: false,
        bestAvailableTechniquesAssessment: false,
        habitatAssessment: 'no'
      })
      return this.redirect({ h, route: Routes.CONFIRM_COST })
    } else {
      return this.redirect({ h })
    }
  }
}
