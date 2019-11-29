'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const ClimateChangeRiskScreeningModel = require('../../models/climateChangeRiskScreening.model')
const ClimateChangeRiskScreening = require('../../models/taskList/climateChangeRiskScreening.task')
const { TASK_LIST } = require('../../routes')

module.exports = class PermitLengthController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

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
