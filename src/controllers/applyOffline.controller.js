'use strict'

const Handlebars = require('handlebars')
const Constants = require('../constants')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const StandardRule = require('../persistence/entities/standardRule.entity')
const CookieService = require('../services/cookie.service')
const LoggingService = require('../services/logging.service')
const RecoveryService = require('../services/recovery.service')
const { OFFLINE_CATEGORIES } = Constants

module.exports = class ApplyOfflineController extends BaseController {
  static getOfflineCategory (categoryId) {
    // Get matching offline category
    return Object.values(OFFLINE_CATEGORIES)
      .find(({ id }) => id === categoryId)
  }

  static getChangeSelectionRoute (offlineCategory = {}, standardRule = {}) {
    const { PERMIT_CATEGORY, PERMIT_SELECT, PERMIT_HOLDER_TYPE } = Routes
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

  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { standardRuleId, permitHolderType } = context

    let standardRule

    const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)
    const offlineCategory = ApplyOfflineController.getOfflineCategory(standardRuleTypeId)
    if (standardRuleId) {
      standardRule = await StandardRule.getById(context, standardRuleId)
    }
    if ((!standardRule && !offlineCategory) || (standardRule && standardRule.canApplyOnline)) {
      LoggingService.logError(`Unable to get offline category for : ${standardRuleTypeId}`)
      return this.redirect({ h, route: Routes.START_AT_BEGINNING })
    }

    const chosenOption = ApplyOfflineController.getChosenOption(offlineCategory, standardRule, permitHolderType)
    this.route.pageHeading = Handlebars.compile(this.orginalPageHeading)({ chosenOption })

    const pageContext = this.createPageContext(h, errors)

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

    return this.showView({ h, pageContext })
  }
}
