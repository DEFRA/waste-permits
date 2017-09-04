'use strict'

const Constants = require('../constants')
const SiteController = require('../controllers/site.controller')
const SiteValidator = require('../validators/site.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.SITE.path,
  config: {
    description: 'The GET Site page',
    handler: SiteController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.SITE.path,
  config: {
    description: 'The POST Site page',
    handler: SiteController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: SiteValidator.getFormValidators(),
      failAction: SiteController.handler
    }
  }
}]
