'use strict'

const Constants = require('../constants')
const ConfirmRulesController = require('../controllers/confirmRules.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.CONFIRM_RULES.path,
  config: {
    description: 'The Confirm that your operation meets the rules page',
    handler: ConfirmRulesController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
