'use strict'

const Constants = require('../constants')
const { WASTE_IN_DEPOSIT_FOR_RECOVERY } = Constants.PermitTypes.STANDARD_RULES
const { MCP_CATEGORIES_PROCESSING_TIME, DEFAULT_CATEGORIES_PROCESSING_TIME } = Constants.PROCESSING_TIME
const Routes = require('../routes')
const BaseController = require('./base.controller')
const CostTime = require('../models/taskList/costTime.task')
const RecoveryService = require('../services/recovery.service')
const StandardRuleType = require('../persistence/entities/standardRuleType.entity')

module.exports = class CostTimeController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(h)
    const context = await RecoveryService.createApplicationContext(h, { applicationLine: true, standardRule: true })
    const { applicationLine = {}, standardRule = {} } = context
    const { categoryName } = await StandardRuleType.getById(context, standardRule.standardRuleTypeId)

    // Default to 0 when the balance hasn't been set
    const { value = 0 } = applicationLine

    pageContext.cost = value.toLocaleString()
    pageContext.time = categoryName.includes('MCP') ? MCP_CATEGORIES_PROCESSING_TIME : DEFAULT_CATEGORIES_PROCESSING_TIME
    pageContext.includesWasteRecoveryPlan = standardRule.code === WASTE_IN_DEPOSIT_FOR_RECOVERY

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    await CostTime.updateCompleteness(context)

    return this.redirect({ h, route: Routes.TASK_LIST })
  }
}
