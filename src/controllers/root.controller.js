'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class RootController extends BaseController {
  static async doGet (request, reply, errors) {
    // For now we are re-directing off to the 'Apply for a standard rules permit' page
    reply.redirect(Constants.Routes.START_OR_OPEN_SAVED.path)
  }

  static handler (request, reply, source, errors) {
    return BaseController.handler(request, reply, errors, RootController, false)
  }
}
