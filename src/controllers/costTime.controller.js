'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CostTime = require('../models/taskList/costTime.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class CostTimeController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {applicationLine = {}} = await RecoveryService.createApplicationContext(h, {applicationLine: true})

    // Default to 0 when the balance hasn't been set
    const {value = 0} = applicationLine

    pageContext.cost = value.toLocaleString()

    return this.showView({request, h, viewPath: 'costTime', pageContext})
  }

  async doPost (request, h) {
    const {authToken, applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

    await CostTime.updateCompleteness(authToken, applicationId, applicationLineId)

    return this.redirect({request, h, redirectPath: Constants.Routes.TASK_LIST.path})
  }
}
