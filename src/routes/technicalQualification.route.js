'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const TechnicalQualificationController = require('../controllers/technicalQualification.controller')
const TechnicalQualificationValidator = require('../validators/technicalQualification.validator')
const validator = new TechnicalQualificationValidator()
const controller = new TechnicalQualificationController(Constants.Routes.TECHNICAL_QUALIFICATION)

module.exports = Route.register('GET, POST', controller, validator)
