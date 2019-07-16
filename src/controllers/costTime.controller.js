'use strict'

const { PROCESSING_TIME, PermitTypes } = require('../constants')
const { WASTE_IN_DEPOSIT_FOR_RECOVERY } = PermitTypes.STANDARD_RULES
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

    // TODO: confirm whether this would be better using:
    //   const applicationCost = await ApplicationCost.getApplicationCostForApplicationId(context)
    //   const value = applicationCost.total.cost

    const { value = 0 } = applicationLine

    pageContext.cost = value.toLocaleString()
    pageContext.time = PROCESSING_TIME[categoryName.toLowerCase()] || PROCESSING_TIME.default
    pageContext.includesWasteRecoveryPlan = standardRule.code === WASTE_IN_DEPOSIT_FOR_RECOVERY

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    await CostTime.updateCompleteness(context)

    return this.redirect({ h, route: Routes.TASK_LIST })
  }
}
