'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const BespokeTaskList = require('../models/taskList/bespoke.taskList')
const StandardRulesTaskList = require('../models/taskList/standardRules.taskList')
const StandardRule = require('../persistence/entities/standardRule.entity')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } } = require('../constants').PermitTypes

module.exports = class TaskListController extends BaseController {
  async getTaskList (context) {
    switch (context.permitType) {
      case STANDARD_RULES: return StandardRulesTaskList.buildTaskList(context)
      case BESPOKE: return BespokeTaskList.buildTaskList(context)
      default: throw new Error(`Unexpected permitType: ${context.permitType}`)
    }
  }

  async doGet (request, h, errors, firstTimeIn = true) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const dataStore = await DataStore.get(context)
    context.permitType = dataStore.data.permitType

    const showError = Boolean(request.query.showError)
    if (showError && firstTimeIn) {
      return this.doGet(request, h, this.setCustomError('any.required', 'task-list-not-complete'), false)
    }

    pageContext.taskList = await this.getTaskList(context)

    if (context.permitType === STANDARD_RULES) {
      pageContext.standardRule = await StandardRule.getByApplicationLineId(context, context.applicationLineId)
    }

    pageContext.formValues = request.payload

    pageContext.permitCategoryRoute = Routes.PERMIT_CATEGORY.path

    return this.showView({ request, h, pageContext })
  }
}
