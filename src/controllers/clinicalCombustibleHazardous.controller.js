'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')

module.exports = class NeedToConsultController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const { data: { acceptsClinicalWaste, acceptsCombustibleWaste, acceptsHazardousWaste, doesntAcceptClinicalCombustibleOrHazardousWaste } } = await DataStore.get(context)

      pageContext.formValues = {
        'clinical': acceptsClinicalWaste,
        'combustible': acceptsCombustibleWaste,
        'hazardous': acceptsHazardousWaste,
        'none-required': doesntAcceptClinicalCombustibleOrHazardousWaste
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const {
      'clinical': acceptsClinicalWaste,
      'combustible': acceptsCombustibleWaste,
      'hazardous': acceptsHazardousWaste,
      'none-required': doesntAcceptClinicalCombustibleOrHazardousWaste
    } = request.payload

    await DataStore.save(context, {
      acceptsClinicalWaste: acceptsClinicalWaste === 'yes',
      acceptsCombustibleWaste: acceptsCombustibleWaste === 'yes',
      acceptsHazardousWaste: acceptsHazardousWaste === 'yes',
      doesntAcceptClinicalCombustibleOrHazardousWaste: doesntAcceptClinicalCombustibleOrHazardousWaste === 'yes'
    })

    return this.redirect({ h })
  }
}
