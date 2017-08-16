'use strict'

const TaskListController = require('../controllers/taskList.controller')

module.exports = [{
  method: ['GET'],
  path: '/task-list',
  config: {
    description: 'The task list page',
    handler: TaskListController.handler
  }
}]
