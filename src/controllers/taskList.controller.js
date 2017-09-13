'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class TaskListController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = BaseController.createPageContext(Constants.Routes.TASK_LIST)

      // TODO: Get the task list from Dynamics
      pageContext.taskList = ['TODO']

      return reply
        .view('taskList', pageContext)
        // .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      request.log('ERROR', error)
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
