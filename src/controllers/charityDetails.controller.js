'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const CharityDetail = require('../models/charityDetail.model')
const Account = require('../persistence/entities/account.entity')
const { INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY } = require('../dynamics').PERMIT_HOLDER_TYPES
const { TRADING_NAME_USAGE } = require('../dynamics')

module.exports = class CharityDetailsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (errors) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const { charityName, charityNumber } = await CharityDetail.get(context)

      pageContext.formValues = {
        'charity-name': charityName,
        'charity-number': charityNumber
      }
    }

    return this.showView({ h, pageContext })
  }

  getRedirectRoute (charityPermitHolder) {
    const { individualRoute, companyRoute, nextRoute } = this.route
    switch (charityPermitHolder) {
      case INDIVIDUAL.id:
        return individualRoute
      case LIMITED_COMPANY.id:
        return companyRoute
      case PUBLIC_BODY.id:
        return nextRoute
      default:
        throw new Error(`Unexpected charityPermitHolder: ${charityPermitHolder}`)
    }
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const {
      'charity-name': charityName,
      'charity-number': charityNumber
    } = request.payload

    const charityDetail = await CharityDetail.get(context)
    Object.assign(charityDetail, { charityName, charityNumber })

    await charityDetail.save(context)

    if (charityDetail.charityPermitHolder === PUBLIC_BODY.id) {
      // TODO: This code is duplicated in tradingName.controller.js. Should we pull this out into a permit holder model?
      let { application, account } = context

      // Create an account for this charity if it doesn't already exist
      if (!account) {
        account = new Account({ organisationType: application.organisationType })
        await account.save(context)
        application.permitHolderOrganisationId = account.id
      }

      application.useTradingName = TRADING_NAME_USAGE.YES
      application.tradingName = charityName
      await application.save(context)

      account.accountName = application.tradingName
      await account.save(context)
    }

    return this.redirect({ h, route: this.getRedirectRoute(charityDetail.charityPermitHolder) })
  }
}
