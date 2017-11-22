'use strict'

const Constants = require('../constants')
const SiteSiteNameController = require('../controllers/siteSiteName.controller')
const SiteSiteNameValidator = require('../validators/siteSiteName.validator')
const controller = new SiteSiteNameController(Constants.Routes.SITE_SITE_NAME)

module.exports = [{
  method: ['GET'],
  path: controller.path,
  config: {
    description: 'The GET Site Name page',
    handler: controller.handler,
    bind: controller
  }
}, {
  method: ['POST'],
  path: controller.path,
  config: {
    description: 'The POST Site Name page',
    handler: controller.handler,
    bind: controller,
    validate: {
      options: {
        allowUnknown: true
      },
      payload: SiteSiteNameValidator.getFormValidators(),
      failAction: controller.failAction
    }
  }
}]
