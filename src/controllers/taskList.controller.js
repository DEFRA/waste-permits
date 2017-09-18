'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const LoggingService = require('../services/logging.service')

module.exports = class TaskListController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.TASK_LIST)

      // TODO: Get the task list from Dynamics
      pageContext.taskList = ['TODO']

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
