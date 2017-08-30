'use strict'

const Constants = require('../constants')
const TaskListController = require('../controllers/taskList.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.TASK_LIST,
  config: {
    description: 'The task list page',
    handler: TaskListController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
