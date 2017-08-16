'use strict'

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
        .state('session', request.state.session)
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
