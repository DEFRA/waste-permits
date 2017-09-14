'use strict'

const Constants = require('../constants')
const SiteSiteNameController = require('../controllers/siteSiteName.controller')
const SiteSiteNameValidator = require('../validators/siteSiteName.validator')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.SITE_SITE_NAME.path,
  config: {
    description: 'The GET Site Name page',
    handler: SiteSiteNameController.handler
  }
}, {
  method: ['POST'],
  path: Constants.Routes.SITE_SITE_NAME.path,
  config: {
    description: 'The POST Site Name page',
    handler: SiteSiteNameController.handler,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: SiteSiteNameValidator.getFormValidators(),
      failAction: SiteSiteNameController.handler
    }
  }
}]
