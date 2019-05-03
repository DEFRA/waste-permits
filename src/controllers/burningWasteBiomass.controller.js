'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class BurningWasteBiomassController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

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

    await taskDeterminants.save({
      bestAvailableTechniquesAssessment,
      habitatAssessmentRequired: false
    })

    return this.redirect({ h })
  }
}
