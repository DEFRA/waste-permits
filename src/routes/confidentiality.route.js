'use strict'

const Constants = require('../constants')
const {CONFIDENTIALITY, TASK_LIST} = Constants.Routes
const ConfidentialityController = require('../controllers/confidentiality.controller')
const ConfidentialityValidator = require('../validators/confidentiality.validator')
const controller = new ConfidentialityController(CONFIDENTIALITY, true, TASK_LIST, ConfidentialityValidator)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Is part of your application commercially confidential?',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: `The POST  Is part of your application commercially confidential?`,
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: controller.validator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
