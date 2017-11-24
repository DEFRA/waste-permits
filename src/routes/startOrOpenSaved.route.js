'use strict'

const Constants = require('../constants')
const StartOrOpenSavedController = require('../controllers/startOrOpenSaved.controller')
const StartOrOpenSavedValidator = require('../validators/startOrOpenSaved.validator')
const controller = new StartOrOpenSavedController(Constants.Routes.START_OR_OPEN_SAVED)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Start Or Resume page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Start Or Resume page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: StartOrOpenSavedValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
