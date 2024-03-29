'use strict'

const Constants = require('../constants')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const StandardRuleType = require('../persistence/entities/standardRuleType.entity')
const { OFFLINE_CATEGORIES, MCP_CATEGORY_NAMES } = Constants
const featureConfig = require('../config/featureConfig')

module.exports = class PermitCategoryController extends BaseController {
  static isOfflineCategory (categoryId) {
    // Check if the categoryId matches one of the offline categories
    return Object.values(OFFLINE_CATEGORIES).some(({ id }) => id === categoryId)
  }

  static isMcpCategory (categoryName) {
    return Boolean(MCP_CATEGORY_NAMES.find((mcpCategoryName) => mcpCategoryName === categoryName))
  }

  static useMcpFeature () {
    return featureConfig.hasMcpFeature
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    let categories = await StandardRuleType.getCategories(context)
    categories.forEach((category) => {
      category.categoryName = category.categoryName.toLowerCase()
    })

    if (!PermitCategoryController.useMcpFeature()) {
      categories = categories.filter(({ categoryName }) => !PermitCategoryController.isMcpCategory(categoryName))
    }

    // Anaerobic standard rules are no longer available so they will not be displayed as an option to be selected
    // for new applications. They still exist in the underlying entity for any existing applications.
    categories = categories.filter(({ categoryName }) => categoryName !== 'anaerobic')

    pageContext.categories = categories

    pageContext.formValues = request.payload

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    CookieService.remove(request, Constants.COOKIE_KEY.STANDARD_RULE_ID)
    // Set the standard rule type ID in the cookie
    const standardRuleTypeId = request.payload['chosen-category']
    CookieService.set(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID, standardRuleTypeId)

    await taskDeterminants.save({ permitCategory: standardRuleTypeId })

    if (PermitCategoryController.isOfflineCategory(standardRuleTypeId)) {
      return this.redirect({ h, route: Routes.APPLY_OFFLINE })
    } else {
      return this.redirect({ h, route: Routes.PERMIT_SELECT })
    }
  }
}
