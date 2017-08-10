'use strict'

module.exports = [{
  method: ['GET'],
  path: '/task-list',
  handler: require('../controllers/taskList.controller')
}]
