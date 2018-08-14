'use strict'

const Constants = require('../constants')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const {firstCharToLowercase} = require('../utilities/utilities')
const StandardRule = require('../models/standardRule.model')
const StandardRuleType = require('../models/standardRuleType.model')
const ApplicationLine = require('../models/applicationLine.model')

module.exports = class PermitSelectController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h)

    pageContext.formValues = request.payload

    const standardRuleTypeId = CookieService.get(request, Constants.COOKIE_KEY.STANDARD_RULE_TYPE_ID)
    const {category = 'all categories'} = await StandardRuleType.getById(context, standardRuleTypeId)
    pageContext.category = firstCharToLowercase(category)

    pageContext.standardRules = await StandardRule.list(context, standardRuleTypeId)
    pageContext.permitCategoryRoute = Routes.PERMIT_CATEGORY.path

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {applicationLine: true})
      let {applicationId, applicationLine} = context

      // Look up the Standard Rule based on the chosen permit type
      const standardRule = await StandardRule.getByCode(context, request.payload['chosen-permit'])

      CookieService.set(request, Constants.COOKIE_KEY.STANDARD_RULE_ID, standardRule.id)

      if (!standardRule.canApplyOnline) {
        return this.redirect({request, h, redirectPath: Routes.APPLY_OFFLINE.path})
      }

      // Delete if it already exists
      if (applicationLine) {
        await applicationLine.delete(context, applicationLine.id)
      }

      // Create a new Application Line in Dynamics and set the applicationLineId in the cookie
      applicationLine = new ApplicationLine({
        applicationId: applicationId,
        standardRuleId: standardRule.id
      })

      await applicationLine.save(context)

      // Set the application ID in the cookie
      CookieService.set(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID, applicationLine.id)

      return this.redirect({request, h, redirectPath: Routes.TASK_LIST.path})
    }
  }
}
