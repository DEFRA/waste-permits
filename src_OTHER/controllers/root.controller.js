'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class RootController extends BaseController {
  async doGet (request, reply) {
    // For now we are re-directing off to the 'Apply for a standard rules permit' page
    reply.redirect(Constants.Routes.START_OR_OPEN_SAVED.path)
  }
}
