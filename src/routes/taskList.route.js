'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const TaskListController = require('../controllers/taskList.controller')
const controller = new TaskListController(Constants.Routes.TASK_LIST)

const routes = [{
  method: 'GET'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
