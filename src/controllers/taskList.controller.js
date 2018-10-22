'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const TaskList = require('../models/taskList/taskList')
const RecoveryService = require('../services/recovery.service')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors, firstTimeIn = true) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const { applicationLineId, standardRule } = context
    const taskList = await TaskList.getByApplicationLineId(context, applicationLineId)

    const showError = Boolean(request.query.showError)
    if (showError && firstTimeIn) {
      return this.doGet(request, h, this.setCustomError('any.required', 'task-list-not-complete'), false)
    }

    pageContext.standardRule = standardRule
    pageContext.taskList = taskList

    pageContext.formValues = request.payload

    pageContext.permitCategoryRoute = Routes.PERMIT_CATEGORY.path

    return this.showView({ request, h, pageContext })
  }
}
