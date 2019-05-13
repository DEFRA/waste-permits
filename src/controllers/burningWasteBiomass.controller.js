'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const BestAvailableTechniquesAssessment = require('../models/taskList/bestAvailableTechniquesAssessment.task')

module.exports = class BurningWasteBiomassController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.thermalRatingOver20 = request.payload['thermal-rating'] === 'over 20'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    const {
      'thermal-rating': thermalRating,
      'meets-criteria': meetsCriteria
    } = request.payload

    const bestAvailableTechniquesAssessment = thermalRating === 'over 20' && meetsCriteria === 'yes'

    await taskDeterminants.save({
      bestAvailableTechniquesAssessment,
      habitatAssessmentRequired: false
    })

    await BestAvailableTechniquesAssessment.updateCompleteness(context)

    return this.redirect({ h })
  }
}
