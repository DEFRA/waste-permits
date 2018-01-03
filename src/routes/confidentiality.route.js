'use strict'

const Constants = require('../constants')
const {CONFIDENTIALITY, TASK_LIST} = Constants.Routes
const BaseRoute = require('./baseRoute')
const ConfidentialityController = require('../controllers/confidentiality.controller')
const ConfidentialityValidator = require('../validators/confidentiality.validator')
const validator = new ConfidentialityValidator()
const controller = new ConfidentialityController(CONFIDENTIALITY, true, TASK_LIST, new ConfidentialityValidator())

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
