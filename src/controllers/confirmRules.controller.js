'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const ConfirmRules = require('../models/confirmRules.model')

module.exports = class ConfirmRulesController extends BaseController {
  async isComplete (authToken, applicationId, applicationLineId) {
    const {complete} = (await ConfirmRules.getByApplicationId(authToken, applicationId, applicationLineId))
    return complete
  }

  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application, standardRule} = await this.createApplicationContext(request, {application: true, standardRule: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.complete = await this.isComplete(authToken, applicationId, applicationLineId)

    return this.showView(request, reply, 'confirmRules', pageContext)
  }

  async doPost (request, reply, errors) {
    const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const complete = await this.isComplete(authToken, applicationId, applicationLineId)
      if (complete) {
        return this.redirect(request, reply, Constants.Routes.TASK_LIST.path)
      }

      const confirmRules = new ConfirmRules({
        applicationLineId: applicationLineId
      })

      await confirmRules.save(authToken)

      return this.redirect(request, reply, Constants.Routes.TASK_LIST.path)
    }
  }
}
