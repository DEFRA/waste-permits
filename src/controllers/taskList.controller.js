'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const StandardRule = require('../models/standardRule.model')
const TaskList = require('../models/taskList/taskList.model')

module.exports = class TaskListController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const application = await Application.getById(authToken, applicationId)

    // If the application has been submitted
    if (application.isSubmitted()) {
      // If the application has not been paid for
      if (!application.isPaidFor()) {
        return this.redirect(request, reply, Constants.Routes.ERROR.NOT_PAID.path)
      } else {
        return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
      }
    }

    pageContext.standardRule = await StandardRule.getByApplicationLineId(authToken, applicationLineId)
    pageContext.taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

    pageContext.formValues = request.payload

    // Not in use for MVP
    // pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path
    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_SELECT.path

    return this.showView(request, reply, 'taskList', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
    return this.doGet(request, reply, errors)
  }
}
