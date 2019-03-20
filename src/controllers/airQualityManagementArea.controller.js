'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const AirQualityManagementAreaModel = require('../models/airQualityManagementArea.model')

module.exports = class AirQualityManagementAreaController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const aqma = await AirQualityManagementAreaModel.get(context)
      pageContext.formValues = {
        'aqma-is-in-aqma': aqma.isInAqma,
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
      isInAqma: isInAqma,
      name: undefined,
      nitrogenDioxideLevel: undefined,
      localAuthorityName: undefined
    }

    if (aqma.isInAqma === 'yes') {
      aqma.name = name
      aqma.nitrogenDioxideLevel = nitrogenDioxideLevel
      aqma.localAuthorityName = localAuthorityName
    }

    const aqmaModel = new AirQualityManagementAreaModel(aqma)
    await aqmaModel.save(context)

    return this.redirect({ h })
  }
}
