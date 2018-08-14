'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const {TRADING_NAME_USAGE} = require('../../dynamics')
const {PERMIT_HOLDER_CONTACT_DETAILS} = require('../../routes')

module.exports = class PermitHolderContactTradingNameController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const {application} = await RecoveryService.createApplicationContext(h, {application: true})

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'use-trading-name': application.useTradingName,
        'trading-name': application.tradingName
      }
    }

    pageContext.useTradingNameOnValue = TRADING_NAME_USAGE.YES
    pageContext.useTradingNameOffValue = TRADING_NAME_USAGE.NO

    // Set checked fields
    pageContext.useTradingNameOn = parseInt(pageContext.formValues['use-trading-name']) === TRADING_NAME_USAGE.YES
    pageContext.useTradingNameOff = parseInt(pageContext.formValues['use-trading-name']) === TRADING_NAME_USAGE.NO

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {application} = context

      // The trading name is only set if the corresponding checkbox is ticked
      application.useTradingName = parseInt(request.payload['use-trading-name'])
      if (application.useTradingName === TRADING_NAME_USAGE.YES) {
        application.tradingName = request.payload['trading-name']
      } else {
        application.tradingName = ''
      }

      await application.save(context)
      return this.redirect({ request, h, redirectPath: PERMIT_HOLDER_CONTACT_DETAILS.path })
    }
  }
}
