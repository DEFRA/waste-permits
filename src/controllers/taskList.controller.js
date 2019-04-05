'use strict'

const Handlebars = require('handlebars')

const Routes = require('../routes')
const BaseController = require('./base.controller')
const BaseTaskList = require('../models/taskList/base.taskList')
const StandardRule = require('../persistence/entities/standardRule.entity')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const ApplicationCostItem = require('../models/triage/applicationCostItem.model')

const { MCP_TYPES } = require('../../src/models/triage/triageLists')

module.exports = class TaskListController extends BaseController {
  static getMcpType (mcpTypeId) {
    return Object.keys(MCP_TYPES)
      .filter((item) => MCP_TYPES[item].id === mcpTypeId)
      .map((item) => MCP_TYPES[item])
      .pop()
  }

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

      const { airDispersionModellingRequired, mcpType, permitType } = dataStore.data

      pageContext.activityName = airDispersionModellingRequired
        ? 'Medium combustion plant site - requires dispersion modelling'
        : 'Medium combustion plant site - does not require dispersion modelling'

      pageContext.mcpType = TaskListController.getMcpType(mcpType)

      pageContext.totalCostIem = new ApplicationCostItem({
        description: 'Total',
        cost: context.application.lineItemsTotalAmount
      })

      pageContext.permitCategoryRoute = `${Routes.TRIAGE_FACILITY_TYPE.path}/${permitType}`
    }

    pageContext.formValues = request.payload

    return this.showView({ h, pageContext })
  }
}
