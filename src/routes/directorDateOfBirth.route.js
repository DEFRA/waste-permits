'use strict'

const Constants = require('../constants')
const DirectorDateOfBirthController = require('../controllers/directorDateOfBirth.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.DIRECTOR_DATE_OF_BIRTH.path,
  config: {
    description: 'The GET Director Date of Birth page',
    handler: DirectorDateOfBirthController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.DIRECTOR_DATE_OF_BIRTH.path,
  config: {
    description: 'The POST Director Date of Birth page',
    handler: DirectorDateOfBirthController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: DirectorDateOfBirthValidator.getFormValidators(),
      failAction: DirectorDateOfBirthController.handler
    }
  }
}]
