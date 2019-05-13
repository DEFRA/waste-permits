'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { STATIONARY_MCP_AND_SG } = require('../dynamics').MCP_TYPES
const { BURNING_WASTE_BIOMASS } = require('../routes')
const BestAvailableTechniquesAssessment = require('../models/taskList/bestAvailableTechniquesAssessment.task')

module.exports = class ThermalInput20To50MwController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.thermalRating20To50 = request.payload['thermal-rating'] === '20 to 50'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    const { mcpType } = taskDeterminants
    const {
      'thermal-rating': thermalRating,
      'engine-type': engineType
    } = request.payload

    const bestAvailableTechniquesAssessment = thermalRating === '20 to 50' && engineType === 'boiler etc'

    await taskDeterminants.save({
      bestAvailableTechniquesAssessment,
      habitatAssessmentRequired: false
    })

    if (!bestAvailableTechniquesAssessment && mcpType === STATIONARY_MCP_AND_SG) {
      await BestAvailableTechniquesAssessment.clearCompleteness(context)
      return this.redirect({ h, route: BURNING_WASTE_BIOMASS })
    }

    await BestAvailableTechniquesAssessment.updateCompleteness(context)

    return this.redirect({ h })
  }
}
