'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const PreApplicationModel = require('../models/preApplication.model')
const { PRE_APPLICATION_ADVICE } = require('../routes')
const DataStore = require('../models/dataStore.model')

module.exports = class PreApplicationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const preApplication = await PreApplicationModel.get(context)

      pageContext.formValues = {
        'received-advice': preApplication.receivedAdvice === 'received-advice',
        'want-advice': preApplication.receivedAdvice === 'want-advice',
        'no-advice': preApplication.receivedAdvice === 'no-advice'
      }
    }
    return this.showView({ h, pageContext })
  }

  async doPost (request, h, errors) {
    let preApplication

    const context = await RecoveryService.createApplicationContext(h)

    const { 'pre-application-advice': receivedAdvice } = request.payload

    const preApplicationModel = new PreApplicationModel(preApplication)
    Object.assign(preApplicationModel, { receivedAdvice })
    await preApplicationModel.save(context)

    await DataStore.save(context, {
      receivedPreApplicationAdvice: receivedAdvice === 'received-advice'
    })

    if (receivedAdvice === 'want-advice') {
      return this.redirect({ h, path: PRE_APPLICATION_ADVICE.wantAdvicePath })
    }

    return this.redirect({ h })
  }
}
