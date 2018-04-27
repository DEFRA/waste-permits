'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const DrainageTypeDrain = require('../models/taskList/drainageTypeDrain.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class DrainageTypeDrainController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, application, standardRule} = await RecoveryService.createApplicationContext(h, {application: true, standardRule: true})

    pageContext.guidanceUrl = standardRule.guidanceUrl
    pageContext.code = standardRule.code
    pageContext.isComplete = await DrainageTypeDrain.isComplete(authToken, application.id, applicationLineId)

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h) {
    const {authToken, applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

    await DrainageTypeDrain.updateCompleteness(authToken, applicationId, applicationLineId)

    return this.redirect({request, h, redirectPath: Constants.Routes.TASK_LIST.path})
  }
}
