'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const {OFFLINE_CATEGORIES} = Constants

module.exports = class ApplyOfflineController extends BaseController {
  static getOfflineCategory (categoryId) {
    // Get matching offline category
    return Object.keys(OFFLINE_CATEGORIES)
      .filter((item) => OFFLINE_CATEGORIES[item].id === categoryId)
      .map((item) => OFFLINE_CATEGORIES[item])
      .pop()
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)

    const offlineCategory = ApplyOfflineController.getOfflineCategory(standardRuleTypeId)
    if (!offlineCategory) {
      LoggingService.logError(`Unable to get offline category for : ${standardRuleTypeId}`)
      return this.redirect(request, h, Constants.Routes.ERROR.START_AT_BEGINNING.path)
    }

    // OfflineCategory will be used in later version of this page
    pageContext.offlineCategory = offlineCategory

    return this.showView(request, h, 'applyOffline', pageContext)
  }
}
