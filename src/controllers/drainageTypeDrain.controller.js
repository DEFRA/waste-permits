'use strict'

const BaseController = require('./base.controller')

module.exports = class DrainageTypeDrainController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    return reply
      .view('drainageTypeDrain', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
