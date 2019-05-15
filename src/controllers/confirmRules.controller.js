'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const ConfirmRules = require('../models/taskList/confirmRules.task')
const RecoveryService = require('../services/recovery.service')

module.exports = class ConfirmRulesController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const { standardRule = {} } = context

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.isComplete = await ConfirmRules.isComplete(context)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    await ConfirmRules.updateCompleteness(context)

    return this.redirect({ h, route: Routes.TASK_LIST })
  }
}
