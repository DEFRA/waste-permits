'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const BaseTaskList = require('../models/taskList/base.taskList')
const StandardRule = require('../persistence/entities/standardRule.entity')
const RecoveryService = require('../services/recovery.service')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors, firstTimeIn = true) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h)

    const showError = Boolean(request.query.showError)
    if (showError && firstTimeIn) {
      return this.doGet(request, h, this.setCustomError('any.required', 'task-list-not-complete'), false)
    }

    const TaskList = await BaseTaskList.getTaskListClass(context)
    pageContext.taskList = await TaskList.buildTaskList(context)

    if (TaskList.isStandardRules) {
      pageContext.standardRule = await StandardRule.getByApplicationLineId(context, context.applicationLineId)
    }

    pageContext.formValues = request.payload

    pageContext.permitCategoryRoute = Routes.PERMIT_CATEGORY.path

    return this.showView({ request, h, pageContext })
  }
}
