'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.task')
const RecoveryService = require('../services/recovery.service')
const Constants = require('../constants')
const StandardRuleType = require('../persistence/entities/standardRuleType.entity')
const CookieService = require('../services/cookie.service')

module.exports = class SiteGridReferenceController extends BaseController {
  async doGet (request, h, errors) {
    let isStandardRuleAndMCP = false
    const pageContext = this.createPageContext(h, errors)

    // Load entity context within the request object
    const context = await RecoveryService.createApplicationContext(h)

    if (context.isStandardRule) {
      // Determine heading and text on page based on whether application is MCP
      // Look up the Standard Rule based on the chosen permit type
      const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)
      const { categoryName } = await StandardRuleType.getById(context, standardRuleTypeId)
      isStandardRuleAndMCP = Constants.MCP_CATEGORY_NAMES.find((mcpCategoryName) => mcpCategoryName === categoryName)
    }
    await customGridRefText(pageContext, isStandardRuleAndMCP)

    if (request.payload) {
      // If we have Site details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-grid-reference': await SiteNameAndLocation.getGridReference(request)
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)

    await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'])

    return this.redirect({ h, route: Routes.POSTCODE_SITE })
  }
}

async function customGridRefText (pageContext, isStandardRuleAndMCP) {
  const pageGridRefText = isStandardRuleAndMCP
    ? 'site\'s main emissions point'
    : 'centre of the site'

  pageContext.pageGridRefText = pageGridRefText
  pageContext.pageHeading = `What is the grid reference for the ${pageGridRefText}?`
  pageContext.pageTitle = Constants.buildPageTitle(pageContext.pageHeading)
}
