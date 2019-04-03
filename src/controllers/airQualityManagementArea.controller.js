'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const AirQualityManagementAreaModel = require('../models/airQualityManagementArea.model')

const YES = 'yes'

module.exports = class AirQualityManagementAreaController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const aqma = await AirQualityManagementAreaModel.get(context)
      // we set a separate no variable for aqma-is-in-aqma as Handlebars only allow us to check whether a variable equates to true/false
      // which causes problems as we can't differentiate between 'aqma-is-in-aqma is false' (ie. No was selected)
      // and 'aqma-is-in-aqma is undefined' (ie. nothing has been selected yet)
      pageContext.formValues = {
        'aqma-is-in-aqma': aqma.isInAqma,
        'aqma-is-in-aqma-no': aqma.isInAqma === false,
        'aqma-name': aqma.isInAqma ? aqma.name : '',
        'aqma-nitrogen-dioxide-level': aqma.isInAqma ? aqma.nitrogenDioxideLevel : '',
        'aqma-local-authority-name': aqma.isInAqma ? aqma.localAuthorityName : ''
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const {
      'aqma-is-in-aqma': isInAqma,
      'aqma-name': name,
      'aqma-nitrogen-dioxide-level': nitrogenDioxideLevel,
      'aqma-local-authority-name': localAuthorityName
    } = request.payload

    const aqma = {
      isInAqma: isInAqma === YES
    }

    if (aqma.isInAqma) {
      aqma.name = name
      aqma.nitrogenDioxideLevel = nitrogenDioxideLevel
      aqma.localAuthorityName = localAuthorityName
    }

    const aqmaModel = new AirQualityManagementAreaModel(aqma)
    await aqmaModel.save(context)

    return this.redirect({ h })
  }
}
