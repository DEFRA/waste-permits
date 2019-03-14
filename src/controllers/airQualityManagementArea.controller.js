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
      const isInAqma = (aqma.aqmaIsInAqma === 'yes')
      pageContext.formValues = {
        'aqma-is-in-aqma': aqma.aqmaIsInAqma,
        'aqma-name': isInAqma ? aqma.aqmaName : '',
        'aqma-nitrogen-dioxide-level': isInAqma ? aqma.aqmaNitrogenDioxideLevel : '',
        'aqma-local-authority-name': isInAqma ? aqma.aqmaLocalAuthorityName : ''
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const {
      'aqma-is-in-aqma': aqmaIsInAqma,
      'aqma-name': aqmaName,
      'aqma-nitrogen-dioxide-level': aqmaNitrogenDioxideLevel,
      'aqma-local-authority-name': aqmaLocalAuthorityName
    } = request.payload

    const aqma = {
      isInAqma: undefined,
      name: undefined,
      nitrogenDioxideLevel: undefined,
      localAuthorityName: undefined
    }

    aqma.isInAqma = aqmaIsInAqma

    if (aqma.isInAqma) {
      aqma.name = aqmaName
      aqma.nitrogenDioxideLevel = aqmaNitrogenDioxideLevel
      aqma.localAuthorityName = aqmaLocalAuthorityName
    }

    const aqmaModel = new AirQualityManagementAreaModel(aqma)
    await aqmaModel.save(context)

    return this.redirect({ h })
  }
}
