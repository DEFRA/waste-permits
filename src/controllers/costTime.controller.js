'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class CostTimeController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    const {application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    return this.showView(request, reply, 'costTime', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
    return this.doGet(request, reply, errors)
  }
}
