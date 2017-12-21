'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const TechnicalQualificationController = require('../controllers/technicalQualification.controller')
const TechnicalQualificationValidator = require('../validators/technicalQualification.validator')
const controller = new TechnicalQualificationController(Constants.Routes.TECHNICAL_QUALIFICATION)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new TechnicalQualificationValidator())
module.exports = route.register()
