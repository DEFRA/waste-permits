'use strict'

const BaseController = require('./base.controller')

module.exports = class DrainageTypeDrainController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    return reply
      .view('drainageTypeDrain', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
  }
}
