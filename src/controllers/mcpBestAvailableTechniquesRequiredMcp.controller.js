'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MOBILE_SG, STATIONARY_SG } = require('../dynamics').MCP_TYPES

module.exports = class BestAvailableTechniquesRequiredMcpController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    if (taskDeterminants.bestAvailableTechniquesAssessment) {
      return this.redirect({ h })
    }

    switch (taskDeterminants.mcpType) {
      case MOBILE_SG:
      case STATIONARY_SG:
        await taskDeterminants.save({ bestAvailableTechniquesAssessment: false })
        return this.redirect({ h })
    }

    if (request.payload) {
      pageContext.thermalRatingOver20 = request.payload['thermal-rating'] === 'over 20'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const {
      'thermal-rating': thermalRating,
      'meets-criteria': meetsCriteria
    } = request.payload

    const bestAvailableTechniquesAssessment = thermalRating === 'over 20' && meetsCriteria === 'yes'

    await taskDeterminants.save({ bestAvailableTechniquesAssessment })
    return this.redirect({ h })
  }
}
