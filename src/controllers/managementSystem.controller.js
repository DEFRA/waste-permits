'use strict'

const BaseController = require('./base.controller')

module.exports = class ManagementSystemController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(request)
    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    // Not implemented yet
    return this.doGet(request, h, errors)
  }
}
