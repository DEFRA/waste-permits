'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

const CookieService = require('../services/cookie.service')

module.exports = class PermitHolderDetailsController extends BaseController {
  async doGet (request, h) {
    const permitHolder = CookieService.get(request, Constants.COOKIE_KEY.PERMIT_HOLDER_TYPE)

    if (permitHolder.id === Constants.PERMIT_HOLDER_TYPES.LIMITED_COMPANY.id) {
      // Re-direct to company details flow
      return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_NUMBER.path})
    } else {
      // Skip company details and go straight to convictions
      return this.redirect({request, h, redirectPath: Constants.Routes.PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH.path})
    }
  }
}
