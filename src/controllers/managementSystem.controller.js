'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class ManagementSystemController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, h, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    return this.showView(request, h, 'managementSystem', pageContext)
  }

  async doPost (request, h, errors) {
    // Not implemented yet
    return this.doGet(request, h, errors)
  }
}
