'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const StandardRule = require('../models/standardRule.model')
const ConfirmRules = require('../models/confirmRules.model')

module.exports = class ConfirmRulesController extends BaseController {
  async isComplete (request) {
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const {complete} = (await ConfirmRules.getByApplicationId(authToken, applicationId, applicationLineId))
    return complete
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return reply
        .redirect(Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }

    const standardRule = await StandardRule.getByApplicationLineId(authToken, applicationLineId)

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.complete = await this.isComplete(request)

    return reply
      .view('confirmRules', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
      const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)

      const complete = await this.isComplete(request)
      if (complete) {
        return reply.redirect(Constants.Routes.TASK_LIST.path)
      }

      const confirmRules = new ConfirmRules({
        applicationLineId: applicationLineId
      })

      await confirmRules.save(authToken)

      return reply
        .redirect(Constants.Routes.TASK_LIST.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }
}
