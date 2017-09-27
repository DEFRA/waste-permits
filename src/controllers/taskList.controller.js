'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const StandardRule = require('../models/standardRule.model')
const LoggingService = require('../services/logging.service')
const TaskListValidator = require('../validators/taskList.validator')
const permits = require('../models/permit.model')

module.exports = class TaskListController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.TASK_LIST, errors, TaskListValidator)

      const applicationId = request.state[Constants.COOKIE_KEY].applicationId
      console.log('applicationId: ', applicationId)

      let authToken
      if (request.state[Constants.COOKIE_KEY]) {
        authToken = request.state[Constants.COOKIE_KEY].authToken
      }
      pageContext.formValues = request.payload

      // For now we are only getting the SR2015 No 18 permit
      pageContext.chosenPermit = 'SR2015 No 18'
      pageContext.standardRule = await StandardRule.getByCode(authToken, pageContext.chosenPermit)
      pageContext.taskList = permits[pageContext.chosenPermit]
      pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

      return reply
        .view('taskList', pageContext)
    } catch (error) {
      LoggingService.logError(error, request)
      return reply.redirect(Constants.Routes.ERROR.path)
    }
  }

  static async doPost (request, reply, errors) {
    // Not implemented yet
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, TaskListController)
  }
}
