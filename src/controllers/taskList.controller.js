'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const TaskList = require('../models/taskList/taskList.model')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, application, payment, standardRule} = await this.createApplicationContext(request, {application: true, payment: true, standardRule: true})
    const taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    pageContext.standardRule = standardRule
    pageContext.taskList = taskList

    pageContext.formValues = request.payload

    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

    return this.showView(request, h, 'taskList', pageContext)
  }

  async doPost (request, h, errors) {
    const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)
    const taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

    const isComplete = await taskList.isComplete(authToken, applicationId, applicationLineId)

    // Perform manual (non-Joi) validation of dynamic form content
    errors = await this._validateDynamicFormContent(request, isComplete)

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      return this.redirect(request, h, Constants.Routes.CHECK_BEFORE_SENDING.path)
    }
  }

  async _validateDynamicFormContent (request, isComplete) {
    let errors

    if (!isComplete) {
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
    }

    return errors
  }
}
