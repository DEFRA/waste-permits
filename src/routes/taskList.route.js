'use strict'

const Constants = require('../constants')
const TaskListController = require('../controllers/taskList.controller')
const controller = new TaskListController(Constants.Routes.TASK_LIST)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The task list page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
