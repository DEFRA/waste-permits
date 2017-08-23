'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class TaskListController extends BaseController {
  static async doGet (request, reply) {
    try {
      const context = {
        pageTitle: 'Waste Permits - Task List',
        // TODO: Load task list here
        taskList: ['TODO']
      }
      return reply
        .view('taskList', context)
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY])
    } catch (error) {
      console.log(error)
      return reply.redirect('/error')
    }
  }

  static async doPost (request, reply) {
    // Not implemented yet
  }

  static handler (request, reply) {
    return BaseController.handler(request, reply, TaskListController)
  }
}
