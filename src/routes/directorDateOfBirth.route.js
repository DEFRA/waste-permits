'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const DirectorDateOfBirthController = require('../controllers/directorDateOfBirth.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const controller = new DirectorDateOfBirthController(Constants.Routes.DIRECTOR_DATE_OF_BIRTH)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new DirectorDateOfBirthValidator())
module.exports = route.register()
