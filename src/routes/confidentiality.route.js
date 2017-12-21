'use strict'

const Constants = require('../constants')
const {CONFIDENTIALITY, TASK_LIST} = Constants.Routes
const BaseRoute = require('./baseRoute')
const ConfidentialityController = require('../controllers/confidentiality.controller')
const ConfidentialityValidator = require('../validators/confidentiality.validator')
const controller = new ConfidentialityController(CONFIDENTIALITY, true, TASK_LIST, new ConfidentialityValidator())

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new ConfidentialityValidator())
module.exports = route.register()
