'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class HabitatAssessmentController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Store the true/false answer and redirect to the next page
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const habitatAssessmentRequired = request.payload['habitat-assessment'] === 'yes'
    await taskDeterminants.save({ habitatAssessmentRequired })

    return this.redirect({ h })
  }
}
