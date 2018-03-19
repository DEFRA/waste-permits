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
    const {application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    pageContext.holderTypes = PermitHolderTypeController.getHolderTypes()

    return this.showView(request, h, 'permitHolderType', pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const permitHolder = PermitHolderTypeController.getHolderTypes()
        .filter(({id}) => request.payload['chosen-holder-type'] === id)
        .pop()

      if (permitHolder) {
        CookieService.set(request, Constants.COOKIE_KEY.PERMIT_HOLDER_TYPE, permitHolder)
        if (permitHolder.canApplyOnline) {
          return this.redirect(request, h, Constants.Routes.PERMIT_CATEGORY.path)
        }
      }

      return this.redirect(request, h, Constants.Routes.APPLY_OFFLINE.path)
    }
  }
}
