'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')

module.exports = class PermitHolderTypeController extends BaseController {
  static getHolderTypes () {
    return Object.keys(Constants.PERMIT_HOLDER_TYPES)
      .map((key) => Constants.PERMIT_HOLDER_TYPES[key])
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.holderTypes = PermitHolderTypeController.getHolderTypes()

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const permitHolder = PermitHolderTypeController.getHolderTypes()
        .filter(({id}) => request.payload['chosen-holder-type'] === id)
        .pop()

      const {PERMIT_HOLDER_TYPE, STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID} = Constants.COOKIE_KEY

      CookieService.remove(request, PERMIT_HOLDER_TYPE)
      CookieService.remove(request, STANDARD_RULE_ID)
      CookieService.remove(request, STANDARD_RULE_TYPE_ID)

      if (permitHolder) {
        CookieService.set(request, PERMIT_HOLDER_TYPE, permitHolder)
        if (permitHolder.canApplyOnline) {
          return this.redirect({request, h, redirectPath: Constants.Routes.PERMIT_CATEGORY.path})
        }
      }

      return this.redirect({request, h, redirectPath: Constants.Routes.APPLY_OFFLINE.path})
    }
  }
}
