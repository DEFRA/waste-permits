'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const ConfirmRules = require('../models/taskList/confirmRules.model')

module.exports = class ConfirmRulesController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, application, standardRule} = await this.createApplicationContext(request, {application: true, standardRule: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.isComplete = await ConfirmRules.isComplete(authToken, applicationLineId)

    return this.showView(request, reply, 'confirmRules', pageContext)
  }

  async doPost (request, reply) {
    const {authToken, applicationLineId} = await this.createApplicationContext(request)

    await ConfirmRules.updateCompleteness(authToken, applicationLineId)

    return this.redirect(request, reply, Constants.Routes.TASK_LIST.path)
  }
}
