'use strict'

const { WASTE_IN_DEPOSIT_FOR_RECOVERY } = require('../constants').PermitTypes.STANDARD_RULES
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CostTime = require('../models/taskList/costTime.task')
const RecoveryService = require('../services/recovery.service')

module.exports = class CostTimeController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(h)
    const context = await RecoveryService.createApplicationContext(h, { applicationLine: true, standardRule: true })
    const { applicationLine = {}, standardRule = {} } = context

    // Default to 0 when the balance hasn't been set
    const { value = 0 } = applicationLine

    pageContext.cost = value.toLocaleString()
    pageContext.includesWasteRecoveryPlan = standardRule.code === WASTE_IN_DEPOSIT_FOR_RECOVERY

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    await CostTime.updateCompleteness(context)

    return this.redirect({ h, route: Routes.TASK_LIST })
  }
}
