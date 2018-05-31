'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PermitHolderNameAndDateOfBirthController = require('../controllers/permitHolderNameAndDateOfBirth.controller')
const PermitHolderNameAndDateOfBirthValidator = require('../validators/permitHolderNameAndDateOfBirth.validator')
const validator = new PermitHolderNameAndDateOfBirthValidator()
const controller = new PermitHolderNameAndDateOfBirthController({route: Constants.Routes.PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH, validator})

module.exports = Route.register('GET, POST', controller, validator)
