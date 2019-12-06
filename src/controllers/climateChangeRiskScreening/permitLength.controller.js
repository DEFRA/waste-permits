'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const ClimateChangeRiskScreeningModel = require('../../models/climateChangeRiskScreening.model')
const ClimateChangeRiskScreening = require('../../models/taskList/climateChangeRiskScreening.task')
const { TASK_LIST } = require('../../routes')

const {
  CLIMATE_CHANGE_RISK_SCREENING_UPLOAD,
  CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD
} = require('../../routes')

module.exports = class PermitLengthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    const climateChangeRiskScreening = await ClimateChangeRiskScreeningModel.get(context)
    const isUploadRequired = await ClimateChangeRiskScreeningModel.isUploadRequired(climateChangeRiskScreening)
    const isPermitLengthLessThan5 = await ClimateChangeRiskScreeningModel.isPermitLengthLessThan5(climateChangeRiskScreening)

    // Redirect to upload screen if applicant has previously answered questions leading to upload being needed
    if (isUploadRequired) {
      return this.redirect({ h, route: CLIMATE_CHANGE_RISK_SCREENING_UPLOAD })
    }

    // Redirect to no-upload screen if applicant has previously answered questions leading to upload not being needed
    // isUploadRequired === false in this case. If questions haven't been answered yet, isUploadRequired === undefined
    // Howeve if they've answered the permit length is less than 5 years then we just want to display the screen as normal
    if (!isPermitLengthLessThan5 && isUploadRequired === false) {
      return this.redirect({ h, route: CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD })
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const climateChangeRiskScreening = await ClimateChangeRiskScreeningModel.get(context)

      pageContext.formValues = {
        'less-than-5': climateChangeRiskScreening.permitLength === 'less-than-5',
        'between-2020-and-2040': climateChangeRiskScreening.permitLength === 'between-2020-and-2040',
        'between-2040-and-2060': climateChangeRiskScreening.permitLength === 'between-2040-and-2060',
        'until-2060-or-beyond': climateChangeRiskScreening.permitLength === 'until-2060-or-beyond'
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    let climateChangeRiskScreening

    const {
      'permit-length': permitLength
    } = request.payload

    const climateChangeRiskScreeningModel = new ClimateChangeRiskScreeningModel(climateChangeRiskScreening)
    Object.assign(climateChangeRiskScreeningModel, { permitLength })
    await climateChangeRiskScreeningModel.save(context)
    await ClimateChangeRiskScreening.updateCompleteness(context)

    if (permitLength === 'less-than-5') {
      return this.redirect({ h, route: TASK_LIST })
    }

    return this.redirect({ h })
  }
}
