'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const ClimateChangeRiskScreeningModel = require('../../models/climateChangeRiskScreening.model')
const ClimateChangeRiskScreening = require('../../models/taskList/climateChangeRiskScreening.task')

const {
  CLIMATE_CHANGE_RISK_SCREENING_UPLOAD,
  CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD
} = require('../../routes')

module.exports = class PermitLengthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const climateChangeRiskScreening = await ClimateChangeRiskScreeningModel.get(context)

      pageContext.formValues = {
        'water-not-required': climateChangeRiskScreening.waterSource === 'water-not-required',
        'surface-or-ground': climateChangeRiskScreening.waterSource === 'surface-or-ground',
        'mains-water': climateChangeRiskScreening.waterSource === 'mains-water'
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const climateChangeRiskScreening = await ClimateChangeRiskScreeningModel.get(context)

    const {
      'water-source': waterSource
    } = request.payload

    Object.assign(climateChangeRiskScreening, { waterSource })

    await climateChangeRiskScreening.save(context)
    await ClimateChangeRiskScreening.updateCompleteness(context)

    const isUploadRequired = await ClimateChangeRiskScreeningModel.isUploadRequired(climateChangeRiskScreening)

    if (isUploadRequired) {
      return this.redirect({ h, route: CLIMATE_CHANGE_RISK_SCREENING_UPLOAD })
    }

    return this.redirect({ h, route: CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD })
  }
}
