'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const ConfirmRules = require('../models/taskList/confirmRules.model')

module.exports = class ConfirmRulesController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, application, payment, standardRule} = await this.createApplicationContext(request, {application: true, payment: true, standardRule: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.isComplete = await ConfirmRules.isComplete(authToken, application.id, applicationLineId)

    return this.showView(request, h, 'confirmRules', pageContext)
  }

  async doPost (request, h) {
    const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

    await ConfirmRules.updateCompleteness(authToken, applicationId, applicationLineId)

    return this.redirect(request, h, Constants.Routes.TASK_LIST.path)
  }
}
