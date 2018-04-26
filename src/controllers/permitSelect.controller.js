'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const StandardRule = require('../models/standardRule.model')
const StandardRuleType = require('../models/standardRuleType.model')
const ApplicationLine = require('../models/applicationLine.model')

module.exports = class PermitSelectController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken} = await RecoveryService.createApplicationContext(h)

    pageContext.formValues = request.payload

    const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)
    const {category = 'all categories'} = await StandardRuleType.getById(authToken, standardRuleTypeId)
    pageContext.category = category.toLowerCase()

    pageContext.standardRules = await StandardRule.list(authToken, standardRuleTypeId)
    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId} = await RecoveryService.createApplicationContext(h)

      // Look up the Standard Rule based on the chosen permit type
      const standardRule = await StandardRule.getByCode(authToken, request.payload['chosen-permit'])

      CookieService.set(request, Constants.COOKIE_KEY.STANDARD_RULE_ID, standardRule.id)

      if (!standardRule.canApplyOnline) {
        return this.redirect({request, h, redirectPath: Constants.Routes.APPLY_OFFLINE.path})
      }

      // Create a new Application Line in Dynamics and set the applicationLineId in the cookie
      const applicationLine = new ApplicationLine({
        applicationId: applicationId,
        standardRuleId: standardRule.id,
        parametersId: undefined
      })

      await applicationLine.save(authToken)

      // Set the application ID in the cookie
      CookieService.set(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID, applicationLine.id)

      return this.redirect({request, h, redirectPath: Constants.Routes.TASK_LIST.path})
    }
  }
}
