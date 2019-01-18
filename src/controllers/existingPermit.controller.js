'use strict'

const BaseController = require('./base.controller')

module.exports = class ExistingPermitController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { 'existing-permit': existingPermit } = request.payload

    if (existingPermit === 'yes') {
      return this.redirect({ h, route: 'MCP_HAS_EXISTING_PERMIT' })
    }
    return this.redirect({ h })
  }
}
