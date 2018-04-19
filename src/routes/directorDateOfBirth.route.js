'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const DirectorDateOfBirthController = require('../controllers/directorDateOfBirth.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const validator = new DirectorDateOfBirthValidator()
const controller = new DirectorDateOfBirthController({route: Constants.Routes.DIRECTOR_DATE_OF_BIRTH, validator})

module.exports = Route.register('GET, POST', controller, validator)
