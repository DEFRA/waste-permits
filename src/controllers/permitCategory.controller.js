'use strict'

const Constants = require('../constants')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const StandardRuleType = require('../persistence/entities/standardRuleType.entity')
const { OFFLINE_CATEGORIES } = Constants

module.exports = class PermitCategoryController extends BaseController {
  static isOfflineCategory (categoryId) {
    // Check if the categoryId matches one of the offline categories
    return Object.keys(OFFLINE_CATEGORIES).some((item) => OFFLINE_CATEGORIES[item].id === categoryId)
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h)

    const categories = await StandardRuleType.getCategories(context)
    categories.forEach((category) => {
      category.categoryName = category.categoryName.toLowerCase()
    })

    pageContext.categories = categories

    pageContext.formValues = request.payload

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      CookieService.remove(request, Constants.COOKIE_KEY.STANDARD_RULE_ID)
      // Set the standard rule type ID in the cookie
      const standardRuleTypeId = request.payload['chosen-category']
      CookieService.set(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID, standardRuleTypeId)

      if (PermitCategoryController.isOfflineCategory(standardRuleTypeId)) {
        return this.redirect({ request, h, redirectPath: Routes.APPLY_OFFLINE.path })
      } else {
        return this.redirect({ request, h, redirectPath: Routes.PERMIT_SELECT.path })
      }
    }
  }
}
