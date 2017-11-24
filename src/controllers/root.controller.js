'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class RootController extends BaseController {
  async doGet (request, reply, errors) {
    // For now we are re-directing off to the 'Apply for a standard rules permit' page
    reply.redirect(Constants.Routes.START_OR_OPEN_SAVED.path)
  }

  handler (request, reply, source, errors) {
    return super.handler(request, reply, source, errors, false)
  }
}
