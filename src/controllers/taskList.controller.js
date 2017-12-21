'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const TaskListValidator = require('../validators/taskList.validator')
const StandardRule = require('../models/standardRule.model')
const TaskList = require('../models/taskList/taskList.model')

module.exports = class TaskListController extends BaseController {
  async doGet (request, reply, errors) {
    // For now we are only getting the SR2015 No 18 permit
    const chosenPermit = 'SR2015 No 18'

    const pageContext = this.createPageContext(errors, new TaskListValidator())
    const authToken = CookieService.getAuthToken(request)

    pageContext.formValues = request.payload
    pageContext.chosenPermit = chosenPermit

    pageContext.standardRule = await StandardRule.getByCode(authToken, pageContext.chosenPermit)

    const applicationLineId = CookieService.getApplicationLineId(request)
    pageContext.taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

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
