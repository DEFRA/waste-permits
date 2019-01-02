'use strict'

const BaseController = require('./base.controller')

module.exports = class PreApplicationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h, errors) {
    // Not implemented yet
    return this.doGet(request, h, errors)
  }
}
