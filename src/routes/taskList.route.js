'use strict'

module.exports = [{
  method: ['GET'],
  path: '/task-list',
  config: {
    description: 'The task list page',
    handler: require('../controllers/taskList.controller')
  }
}]
