'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const ConfirmRules = require('../models/confirmRules.model')

module.exports = class ConfirmRulesController extends BaseController {
  async isComplete (request) {
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)
    const {complete} = (await ConfirmRules.getByApplicationId(authToken, applicationId, applicationLineId))
    return complete
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.complete = await this.isComplete(request)
    return reply
      .view('confirmRules', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      const complete = await this.isComplete(request)
      if (complete) {
        return reply.redirect(Constants.Routes.TASK_LIST.path)
      }

      const confirmRules = new ConfirmRules({
        applicationLineId: applicationLineId
      })

      await confirmRules.save(authToken)
      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
