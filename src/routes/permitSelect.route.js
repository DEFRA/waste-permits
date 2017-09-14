'use strict'

const Constants = require('../constants')
const PermitSelectController = require('../controllers/permitSelect.controller')

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.PERMIT_SELECT.path,
  config: {
    description: 'The Select a permit page',
    handler: PermitSelectController.handler,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
