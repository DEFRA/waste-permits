'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const ClimateChangeRiskScreeningModel = require('../../models/climateChangeRiskScreening.model')
const ClimateChangeRiskScreening = require('../../models/taskList/climateChangeRiskScreening.task')

module.exports = class PermitLengthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const climateChangeRiskScreening = await ClimateChangeRiskScreeningModel.get(context)

      pageContext.formValues = {
        'not-in-flood-risk-zone': climateChangeRiskScreening.floodRisk === 'not-in-flood-risk-zone',
        'very-low-or-low': climateChangeRiskScreening.floodRisk === 'very-low-or-low',
        medium: climateChangeRiskScreening.floodRisk === 'medium',
        high: climateChangeRiskScreening.floodRisk === 'high'
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    let climateChangeRiskScreening

    const {
      'flood-risk': floodRisk
    } = request.payload

    const climateChangeRiskScreeningModel = new ClimateChangeRiskScreeningModel(climateChangeRiskScreening)
    Object.assign(climateChangeRiskScreeningModel, { floodRisk })
    await climateChangeRiskScreeningModel.save(context)
    await ClimateChangeRiskScreening.updateCompleteness(context)

    return this.redirect({ h })
  }
}
