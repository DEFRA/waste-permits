'use strict'

const DataStore = require('../models/dataStore.model')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MOBILE_SG, STATIONARY_MCP } = require('../dynamics').MCP_TYPES

module.exports = class BestAvailableTechniquesRequiredSgController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    const { mcpType = {} } = context
    switch (mcpType.id) {
      case MOBILE_SG.id:
      case STATIONARY_MCP.id:
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

    const {
      'thermal-rating': thermalRating,
      'engine-type': engineType
    } = request.payload

    const bestAvailableTechniquesAssessment = thermalRating === '20 to 50' && engineType === 'boiler etc'

    await DataStore.save(context, { bestAvailableTechniquesAssessment })
    return this.redirect({ h })
  }
}
