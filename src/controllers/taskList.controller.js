'use strict'

const Handlebars = require('handlebars')

const Routes = require('../routes')
const BaseController = require('./base.controller')
const BaseTaskList = require('../models/taskList/base.taskList')
const StandardRule = require('../persistence/entities/standardRule.entity')
const RecoveryService = require('../services/recovery.service')

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
    }

    pageContext.formValues = request.payload

    pageContext.permitCategoryRoute = Routes.PERMIT_CATEGORY.path

    return this.showView({ h, pageContext })
  }
}
