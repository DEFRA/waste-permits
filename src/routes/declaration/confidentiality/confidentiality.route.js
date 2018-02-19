'use strict'

const Constants = require('../../../constants')
const {CONFIDENTIALITY, TASK_LIST} = Constants.Routes
const Route = require('../../baseRoute')
const ConfidentialityController = require('../../../controllers/declaration/confidentiality/confidentiality.controller')
const ConfidentialityValidator = require('../../../validators/declaration/confidentiality/confidentiality.validator')
const validator = new ConfidentialityValidator()
const controller = new ConfidentialityController(CONFIDENTIALITY, validator, true, TASK_LIST)

module.exports = Route.register('GET, POST', controller, validator)
