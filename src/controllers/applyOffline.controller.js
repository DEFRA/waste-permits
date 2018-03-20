'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const StandardRule = require('../models/standardRule.model')
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

  static getChangeSelectionRoute (offlineCategory = {}, standardRule = {}) {
    const {PERMIT_CATEGORY, PERMIT_SELECT, PERMIT_HOLDER_TYPE} = Constants.Routes
    if (standardRule.permitName) {
      return PERMIT_SELECT
    } else if (offlineCategory.category) {
      return PERMIT_CATEGORY
    } else {
      return PERMIT_HOLDER_TYPE
    }
  }

  static getChosenOption (offlineCategory = {}, standardRule = {}, permitHolderType = {}) {
    if (standardRule.permitName) {
      return `${standardRule.permitName.toLowerCase()} - ${standardRule.code}`
    } else if (offlineCategory.category) {
      return `${offlineCategory.category.toLowerCase()} permits`
    } else if (permitHolderType.type) {
      const type = permitHolderType.type.toLowerCase()
      // prefix with 'an' or 'a' dependent on whether the type starts with a vowl
      return `a permit for ${/^[aeiou]$/.test(type[0]) ? 'an' : 'a'} ${type}`
    } else {
      throw new Error('Unable to get chosen option')
    }
  }

  constructor (...args) {
    const [route] = args
    super(...args)
    this.orginalPageHeading = route.pageHeading
  }

  async doGet (request, h, errors) {
    const {authToken, application, payment, standardRuleId, permitHolderType} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    let offlineCategory
    let standardRule

    if (permitHolderType.canApplyOnline) {
      const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)
      offlineCategory = ApplyOfflineController.getOfflineCategory(standardRuleTypeId)
      if (standardRuleId) {
        standardRule = await StandardRule.getById(authToken, standardRuleId)
      }
      if ((!standardRule && !offlineCategory) || (standardRule && standardRule.canApplyOnline)) {
        LoggingService.logError(`Unable to get offline category for : ${standardRuleTypeId}`)
        return this.redirect(request, h, Constants.Routes.ERROR.START_AT_BEGINNING.path)
      }
    }

    const chosenOption = ApplyOfflineController.getChosenOption(offlineCategory, standardRule, permitHolderType)
    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({chosenOption})

    const pageContext = this.createPageContext(errors)

    pageContext.changeSelectionLink = ApplyOfflineController.getChangeSelectionRoute(offlineCategory, standardRule).path

    if (offlineCategory) {
      switch (offlineCategory.id) {
        case 'offline-category-flood':
          pageContext.offlineCategoryFlood = true
          break
        case 'offline-category-water':
          pageContext.offlineCategoryWater = true
          break
        case 'offline-category-radioactive':
          pageContext.offlineCategoryRadioactive = true
          break
        default:
          pageContext.offlineCategoryOther = true
      }
    } else {
      pageContext.offlineCategoryOther = true
    }

    return this.showView(request, h, 'applyOffline', pageContext)
  }
}
