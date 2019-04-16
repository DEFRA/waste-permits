'use strict'

const DataStore = require('../models/dataStore.model')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MOBILE_SG, STATIONARY_SG } = require('../dynamics').MCP_TYPES

module.exports = class BestAvailableTechniquesRequiredMcpController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const dataStore = await DataStore.get(context)

    if (dataStore.data.bestAvailableTechniquesAssessment === true) {
      return this.redirect({ h })
    }

    const { mcpType = {} } = context
    switch (mcpType.id) {
      case MOBILE_SG.id:
      case STATIONARY_SG.id:
        await DataStore.save(context, { bestAvailableTechniquesAssessment: false })
        return this.redirect({ h })
    }

    if (request.payload) {
      pageContext.thermalRatingOver20 = request.payload['thermal-rating'] === 'over 20'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const {
      'thermal-rating': thermalRating,
      'meets-criteria': meetsCriteria
    } = request.payload

    const bestAvailableTechniquesAssessment = thermalRating === 'over 20' && meetsCriteria === 'yes'

    await DataStore.save(context, { bestAvailableTechniquesAssessment })
    return this.redirect({ h })
  }
}
