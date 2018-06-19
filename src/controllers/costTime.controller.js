'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const CostTime = require('../models/taskList/costTime.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class CostTimeController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const context = await RecoveryService.createApplicationContext(h, {applicationLine: true})
    const {applicationLine = {}} = context

    // Default to 0 when the balance hasn't been set
    const {value = 0} = applicationLine

    pageContext.cost = value.toLocaleString()

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const {applicationId, applicationLineId} = context

    await CostTime.updateCompleteness(context, applicationId, applicationLineId)

    return this.redirect({request, h, redirectPath: Routes.TASK_LIST.path})
  }
}
