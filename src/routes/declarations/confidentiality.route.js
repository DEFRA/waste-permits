'use strict'

const Constants = require('../../constants')
const {CONFIDENTIALITY, TASK_LIST} = Constants.Routes
const Route = require('../baseRoute')
const ConfidentialityController = require('../../controllers/declarations/confidentiality.controller')
const ConfidentialityValidator = require('../../validators/confidentiality.validator')
const validator = new ConfidentialityValidator()
const controller = new ConfidentialityController(CONFIDENTIALITY, true, TASK_LIST, new ConfidentialityValidator())

module.exports = Route.register('GET, POST', controller, validator)
