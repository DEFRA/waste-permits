'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const StandardRule = require('../models/standardRule.model')
const TaskList = require('../models/taskList/taskList.model')

module.exports = class TaskListController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.getAuthToken(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    pageContext.standardRule = await StandardRule.getByApplicationLineId(authToken, applicationLineId)
    pageContext.taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

    pageContext.formValues = request.payload

    // Not in use for MVP
    // pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path
    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_SELECT.path

    return reply
      .view('taskList', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
