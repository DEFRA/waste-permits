'use strict'

const BaseController = require('./base.controller')

module.exports = class PrivacyController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    return this.showView(request, reply, 'privacy', pageContext)
  }
}
