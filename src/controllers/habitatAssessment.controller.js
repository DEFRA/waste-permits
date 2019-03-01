'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const { MCP_TYPES: { MOBILE_SG, MOBILE_SG_AND_MCP } } = require('../models/triage/triageLists')

module.exports = class HabitatAssessmentController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    const context = await RecoveryService.createApplicationContext(h)
    const { data: { mcpType } } = await DataStore.get(context)
    if (mcpType === MOBILE_SG.id ||
        mcpType === MOBILE_SG_AND_MCP.id) {
      // Set the habitatAssessment to 'no' and redirect to the next page
      await DataStore.save(context, { habitatAssessment: 'no' })
      return this.redirect({ h })
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Store the answer and redirect to the next page
    const context = await RecoveryService.createApplicationContext(h)
    await DataStore.save(context, { habitatAssessment: request.payload['habitat-assessment'] })

    return this.redirect({ h })
  }
}
