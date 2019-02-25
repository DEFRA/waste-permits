'use strict'

const DataStore = require('../models/dataStore.model')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class TechnicalQualificationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.newOrRefurbished = request.payload['new-or-refurbished'] === 'yes'
      pageContext.notNewOrRefurbished = request.payload['new-or-refurbished'] === 'no'
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const energyEfficiencyReportRequired = request.payload['new-or-refurbished'] === 'yes' &&
                                           request.payload['total-aggregated-thermal-input'] === 'over 20' &&
                                           request.payload['engine-type'] === 'boiler etc'

    await DataStore.save(context, { energyEfficiencyReportRequired })
    return this.redirect({ h })
  }
}
