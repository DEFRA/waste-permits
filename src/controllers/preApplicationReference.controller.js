'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const PreApplicationModel = require('../models/preApplication.model')

module.exports = class PreApplicationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const { application } = context

      pageContext.formValues = {
        'pre-application-reference': application.preApplicationReference
      }
    }
    return this.showView({ h, pageContext })
  }

  async doPost (request, h, errors) {
    let preApplication

    const context = await RecoveryService.createApplicationContext(h)

    const { 'pre-application-reference': preApplicationReference } = request.payload
    const preApplicationModel = new PreApplicationModel(preApplication)
    Object.assign(preApplicationModel, { preApplicationReference })
    await preApplicationModel.save(context)

    return this.redirect({ h })
  }
}
