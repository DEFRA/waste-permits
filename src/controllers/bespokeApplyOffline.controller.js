'use strict'

const BaseController = require('./base.controller')

module.exports = class BespokeApplyOfflineController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    return this.showView({ request, h, pageContext })
  }
}