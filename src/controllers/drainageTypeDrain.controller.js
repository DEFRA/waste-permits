'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const DrainageTypeDrain = require('../models/taskList/drainageTypeDrain.model')

module.exports = class DrainageTypeDrainController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, application, standardRule} = await this.createApplicationContext(request, {application: true, standardRule: true})

    if (application.isSubmitted()) {
      return this.redirect(request, h, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.isComplete = await DrainageTypeDrain.isComplete(authToken, applicationLineId)

    return this.showView(request, h, 'drainageTypeDrain', pageContext)
  }

  async doPost (request, h) {
    const {authToken, applicationLineId} = await this.createApplicationContext(request)

    await DrainageTypeDrain.updateCompleteness(authToken, applicationLineId)

    return this.redirect(request, h, Constants.Routes.TASK_LIST.path)
  }
}
