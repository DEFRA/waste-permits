'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const { TRADING_NAME_USAGE } = require('../../dynamics')

module.exports = class PermitHolderContactTradingNameController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'trading-name': application.tradingName
      }
    }
    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { application } = context

      application.useTradingName = TRADING_NAME_USAGE.YES
      application.tradingName = request.payload['trading-name']

      await application.save(context)
      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }
}
