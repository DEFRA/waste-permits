'use strict'

const Constants = require('../constants')
const StartOrOpenSavedController = require('../controllers/startOrOpenSaved.controller')
const StartOrOpenSavedValidator = require('../validators/startOrOpenSaved.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.START_OR_OPEN_SAVED.path,
  config: {
    description: 'The GET Start Or Resume page',
    handler: StartOrOpenSavedController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.START_OR_OPEN_SAVED.path,
  config: {
    description: 'The POST Start Or Resume page',
    handler: StartOrOpenSavedController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: StartOrOpenSavedValidator.getFormValidators(),
      failAction: StartOrOpenSavedController.handler
    }
  }
}]
