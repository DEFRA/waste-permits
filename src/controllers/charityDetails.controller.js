'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const CharityDetail = require('../models/charityDetail.model')
const { INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY } = require('../dynamics').PERMIT_HOLDER_TYPES

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

    return this.showView({ request, h, pageContext })
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

    return this.redirect({ request, h, route: this.getRedirectRoute(charityDetail.charityPermitHolder) })
  }
}
