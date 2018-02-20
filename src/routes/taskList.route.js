'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const TaskListController = require('../controllers/taskList.controller')
const controller = new TaskListController(Constants.Routes.TASK_LIST)

module.exports = Route.register('GET, POST', controller)
