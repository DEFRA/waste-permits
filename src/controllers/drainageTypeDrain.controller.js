'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class DrainageTypeDrainController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const appContext = await this.createApplicationContext(request, {application: true})

    if (appContext.application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    return this.showView(request, reply, 'drainageTypeDrain', pageContext)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
    return this.doGet(request, reply, errors)
  }
}
