'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const TaskList = require('../models/taskList/taskList.model')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, application, standardRule} = await this.createApplicationContext(request, {application: true, standardRule: true})

    // If the application has been submitted
    if (application.isSubmitted()) {
      // If the application has not been paid for
      if (!application.isPaidFor()) {
        return this.redirect(request, h, Constants.Routes.ERROR.NOT_PAID.path)
      } else {
        return this.redirect(request, h, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
      }
    }

    pageContext.standardRule = standardRule
    pageContext.taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

    pageContext.formValues = request.payload

    // Not in use for MVP
    // pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path
    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_SELECT.path

    return this.showView(request, h, 'taskList', pageContext)
  }

  async doPost (request, h, errors) {
    // Not implemented yet
    return this.doGet(request, h, errors)
  }
}
