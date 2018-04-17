'use strict'

const BaseController = require('./base.controller')

module.exports = class ManagementSystemController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext()
    const {application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect({request, h, redirectPath})
    }

    return this.showView({request, h, viewPath: 'managementSystem', pageContext})
  }

  async doPost (request, h, errors) {
    // Not implemented yet
    return this.doGet(request, h, errors)
  }
}
