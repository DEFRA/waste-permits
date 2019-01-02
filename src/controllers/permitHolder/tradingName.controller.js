'use strict'

const BaseController = require('../base.controller')
const Account = require('../../persistence/entities/account.entity')
const RecoveryService = require('../../services/recovery.service')

const { TRADING_NAME_USAGE } = require('../../dynamics')

module.exports = class PermitHolderContactTradingNameController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'trading-name': application.tradingName
      }
    }
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true, account: true })
    let { application, account } = context

    // Create an account for this partnership if it doesn't already exist
    if (!account) {
      account = new Account({ organisationType: application.organisationType })
      await account.save(context)
      application.permitHolderOrganisationId = account.id
    }

    application.useTradingName = TRADING_NAME_USAGE.YES
    application.tradingName = request.payload['trading-name']
    await application.save(context)

    account.accountName = application.tradingName
    await account.save(context)
    return this.redirect({ h })
  }
}
