'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class TaskListController extends BaseController {
  static async doGet (request, reply, errors) {
    try {
      const pageContext = {
        pageTitle: 'Waste Permits - Task List',
        // TODO: Load task list here
        taskList: ['TODO']
      }
      return reply
        .view('taskList', pageContext)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.log(error)
      return reply.redirect(Constants.Routes.ERROR)
    }
  }

  static async doPost (request, reply, errors) {
    // Not implemented yet
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, TaskListController)
  }
}
