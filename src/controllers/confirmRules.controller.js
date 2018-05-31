'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const ConfirmRules = require('../models/taskList/confirmRules.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class ConfirmRulesController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const context = await RecoveryService.createApplicationContext(h, {application: true, standardRule: true})
    const {applicationLineId, application, standardRule} = context

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.isComplete = await ConfirmRules.isComplete(context, application.id, applicationLineId)

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const {applicationId, applicationLineId} = context

    await ConfirmRules.updateCompleteness(context, applicationId, applicationLineId)

    return this.redirect({request, h, redirectPath: Constants.Routes.TASK_LIST.path})
  }
}
