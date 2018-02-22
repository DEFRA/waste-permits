'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PermitHolderTypeController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()

    return reply
      .view('permitHolderType', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
    return this.doGet(request, reply, errors)
  }
}
