'use strict'

const Handlebars = require('handlebars')

const Routes = require('../routes')
const BaseController = require('./base.controller')
const BaseTaskList = require('../models/taskList/base.taskList')
const StandardRule = require('../persistence/entities/standardRule.entity')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const ApplicationCostItem = require('../models/triage/applicationCostItem.model')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors, firstTimeIn = true) {
    const context = await RecoveryService.createApplicationContext(h)
    const TaskList = await BaseTaskList.getTaskListClass(context)

    const permitType = TaskList.isStandardRules ? 'standard rules' : 'bespoke'
    this.route.pageHeading = await Handlebars.compile(this.orginalPageHeading)({ permitType })

    const pageContext = this.createPageContext(h, errors)

    const showError = Boolean(request.query.showError)
    if (showError && firstTimeIn) {
      return this.doGet(request, h, this.setCustomError('any.required', 'task-list-not-complete'), false)
    }

    pageContext.taskList = await TaskList.buildTaskList(context)

    if (TaskList.isStandardRules) {
      pageContext.standardRule = await StandardRule.getByApplicationLineId(context, context.applicationLineId)
      pageContext.permitCategoryRoute = Routes.PERMIT_CATEGORY.path
    } else {
      const dataStore = await DataStore.get(context)

      const { airDispersionModellingRequired } = dataStore.data

      pageContext.activityName = airDispersionModellingRequired
        ? 'Medium combustion plant site - requires dispersion modelling'
        : 'Medium combustion plant site - does not require dispersion modelling'

      pageContext.mcpType = context.mcpType

      pageContext.totalCostIem = new ApplicationCostItem({
        description: 'Total',
        cost: context.application.lineItemsTotalAmount
      })

      pageContext.permitCategoryRoute = Routes.BESPOKE_OR_STANDARD_RULES.path
    }

    pageContext.formValues = request.payload

    return this.showView({ h, pageContext })
  }
}
