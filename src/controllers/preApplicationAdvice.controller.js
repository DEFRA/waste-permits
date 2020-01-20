'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const PreApplicationModel = require('../models/preApplication.model')
const { PRE_APPLICATION_ADVICE } = require('../routes')

module.exports = class PreApplicationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const preApplication = await PreApplicationModel.get(context)

      pageContext.formValues = {
        'received-advice': preApplication.receivedPreApplicationAdvice === 'received-advice',
        'want-advice': preApplication.receivedPreApplicationAdvice === 'want-advice',
        'no-advice': preApplication.receivedPreApplicationAdvice === 'no-advice'
      }
    }
    return this.showView({ h, pageContext })
  }

  async doPost (request, h, errors) {
    let preApplication

    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    const { 'pre-application-advice': receivedPreApplicationAdvice } = request.payload

    const preApplicationModel = new PreApplicationModel(preApplication)
    Object.assign(preApplicationModel, { receivedPreApplicationAdvice })
    await preApplicationModel.save(context)

    await taskDeterminants.save({
      receivedPreApplicationAdvice: receivedPreApplicationAdvice === 'received-advice'
    })

    if (receivedPreApplicationAdvice === 'want-advice') {
      return this.redirect({ h, path: PRE_APPLICATION_ADVICE.wantAdvicePath })
    }

    return this.redirect({ h })
  }
}
