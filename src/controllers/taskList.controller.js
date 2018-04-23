'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const TaskList = require('../models/taskList/taskList.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors, firstTimeIn = true) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, standardRule} = await RecoveryService.createApplicationContext(h, {standardRule: true})
    const taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

    const showError = Boolean(request.query.showError)
    if (showError && firstTimeIn) {
      errors = await this._buildError(request)
      // We have to call the doGet() method again to make the error message appear in the page
      return this.doGet(request, h, errors, false)
    }

    pageContext.standardRule = standardRule
    pageContext.taskList = taskList

    pageContext.formValues = request.payload

    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

    return this.showView({request, h, viewPath: 'taskList', pageContext})
  }

  async _buildError (request) {
    let errors
    const errorPath = 'task-list-not-complete'
    errors = {
      details: [
        {
          message: `"${errorPath}" is required`,
          path: [errorPath],
          type: 'any.required',
          context: { key: errorPath, label: errorPath }
        }]
    }
    return errors
  }
}
