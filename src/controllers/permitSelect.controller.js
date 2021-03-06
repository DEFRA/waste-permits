'use strict'

const Constants = require('../constants')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const { firstCharToLowercase } = require('../utilities/utilities')
const StandardRule = require('../persistence/entities/standardRule.entity')
const StandardRuleType = require('../persistence/entities/standardRuleType.entity')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const { PermitTypes } = require('../dynamics')
const { STANDARD_RULES: { id: STANDARD_RULES } } = Constants.PermitTypes
const { BUSINESS_TRACKS, REGIMES } = require('../dynamics')

module.exports = class PermitSelectController extends BaseController {
  async setRegimeAndBusinessTrack ({ context, regime, businessTrack }) {
    const { application } = context
    application.regime = regime
    application.businessTrack = businessTrack
    await application.save(context)
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    pageContext.formValues = request.payload

    const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)
    const { category = 'all categories' } = await StandardRuleType.getById(context, standardRuleTypeId)
    pageContext.category = firstCharToLowercase(category)

    pageContext.standardRules = await StandardRule.list(context, standardRuleTypeId)
    pageContext.permitCategoryRoute = Routes.PERMIT_CATEGORY.path

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { applicationLine: true })
    let { application, applicationLine, taskDeterminants } = context

    // Look up the Standard Rule based on the chosen permit type
    const standardRule = await StandardRule.getByCryptoId(context, request.payload['chosen-permit'])
    const { categoryName } = await StandardRuleType.getById(context, standardRule.standardRuleTypeId)
    const isMcp = Constants.MCP_CATEGORY_NAMES.find((mcpCategoryName) => mcpCategoryName === categoryName)

    CookieService.set(request, Constants.COOKIE_KEY.STANDARD_RULE_ID, standardRule.id)

    if (!standardRule.canApplyOnline) {
      return this.redirect({ h, route: Routes.APPLY_OFFLINE })
    }

    // Delete if it already exists
    if (applicationLine) {
      await applicationLine.delete(context, applicationLine.id)
    }

    // Create a new Application Line in Dynamics and set the applicationLineId in the cookie
    applicationLine = new ApplicationLine({
      applicationId: application.id,
      standardRuleId: standardRule.id,
      permitType: PermitTypes.STANDARD
    })

    await applicationLine.save(context)

    // Set the application ID in the cookie
    CookieService.set(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID, applicationLine.id)

    // Save the permit type in the Data store
    await taskDeterminants.save({ permitType: STANDARD_RULES })

    if (isMcp) {
      await this.setRegimeAndBusinessTrack({
        context,
        regime: REGIMES.MCP.dynamicsGuid,
        businessTrack: BUSINESS_TRACKS.MCP_STANDARD_RULES.dynamicsGuid
      })

      return this.redirect({ h, route: Routes.MCP_EXISTING_PERMIT })
    }

    await this.setRegimeAndBusinessTrack({
      context,
      regime: REGIMES.WASTE.dynamicsGuid,
      businessTrack: BUSINESS_TRACKS.WASTE_STANDARD_RULES.dynamicsGuid
    })

    return this.redirect({ h, route: Routes.TASK_LIST })
  }
}
