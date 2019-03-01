'use strict'

const DataStore = require('../models/dataStore.model')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MCP_TYPES: { MOBILE_SG, STATIONARY_MCP } } = require('../models/triage/triageLists')

module.exports = class BestAvailableTechniquesRequiredSgController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const dataStore = await DataStore.get(context)

    // TODO: Confirm if we need to redirect on mobile SG which is also MCP
    if (dataStore.data.mcpType === MOBILE_SG.id ||
        dataStore.data.mcpType === STATIONARY_MCP.id) {
      await DataStore.save(context, { bestAvailableTechniquesAssessment: false })
      return this.redirect({ h })
    }

    if (request.payload) {
      pageContext.thermalRating20To50 = request.payload['thermal-rating'] === '20 to 50'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const bestAvailableTechniquesAssessment = request.payload['thermal-rating'] === '20 to 50' &&
                                           request.payload['engine-type'] === 'boiler etc'

    await DataStore.save(context, { bestAvailableTechniquesAssessment })
    return this.redirect({ h })
  }
}
