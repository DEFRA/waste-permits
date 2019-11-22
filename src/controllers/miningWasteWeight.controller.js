'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class MiningWasteWeightController extends BaseController {
  async doGet (request, h, errors) {
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'mining-waste-weight': application.miningWasteWeight
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context

    application.miningWasteWeight = String(request.payload['mining-waste-weight'])
    await application.save(context, ['miningWasteWeight'])

    return this.redirect({ h })
  }
}
