'use strict'

const Constants = require('../constants')
const DirectorDateOfBirthController = require('../controllers/directorDateOfBirth.controller')
const DirectorDateOfBirthValidator = require('../validators/directorDateOfBirth.validator')
const controller = new DirectorDateOfBirthController(Constants.Routes.DIRECTOR_DATE_OF_BIRTH)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Director Date of Birth page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Director Date of Birth page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: DirectorDateOfBirthValidator.prototype.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
