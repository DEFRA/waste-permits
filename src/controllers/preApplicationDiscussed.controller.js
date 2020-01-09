'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const PreApplicationModel = require('../models/preApplication.model')
const { PRE_APPLICATION } = require('../routes')

module.exports = class PreApplicationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const preApplication = await PreApplicationModel.get(context)

      pageContext.formValues = {
        'received-advice': preApplication.discussedApplication === 'received-advice',
        'want-advice': preApplication.discussedApplication === 'want-advice',
        'no-advice': preApplication.discussedApplication === 'no-advice'
      }
    }
    return this.showView({ h, pageContext })
  }

  async doPost (request, h, errors) {
    let preApplication

    const context = await RecoveryService.createApplicationContext(h)

    const { 'pre-application-discussed': discussedApplication } = request.payload

    const preApplicationModel = new PreApplicationModel(preApplication)
    Object.assign(preApplicationModel, { discussedApplication })
    await preApplicationModel.save(context)

    if (discussedApplication === 'want-advice') {
      return this.redirect({ h, path: PRE_APPLICATION.wantAdvicePath })
    }

    return this.redirect({ h })
  }
}
