'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const TaskListController = require('../controllers/taskList.controller')
const TaskListValidator = require('../validators/taskList.validator')
const validator = new TaskListValidator()
const controller = new TaskListController(Constants.Routes.TASK_LIST, validator)

module.exports = Route.register('GET, POST', controller, validator)
