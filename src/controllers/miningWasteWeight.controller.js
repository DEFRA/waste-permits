'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const MiningWasteDetails = require('../models/taskList/miningWasteDetails.task')

module.exports = class MiningWasteWeightController extends BaseController {
  async doGet (request, h, errors) {
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'mining-waste-weight': application.miningWasteWeight
      }
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }
    const context = await RecoveryService.createApplicationContext(h)
    const { application, applicationId, applicationLineId } = context

    application.miningWasteWeight = request.payload['mining-waste-weight']
    await application.save(context, ['miningWasteWeight'])

    await MiningWasteDetails.updateCompleteness(context, applicationId, applicationLineId)

    return this.redirect({ request, h, redirectPath: this.nextPath })
  }
}
