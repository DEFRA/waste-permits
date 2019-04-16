'use strict'

const BaseController = require('./base.controller')

module.exports = class BespokeApplyOfflineController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    pageContext.changeSelectionLink = this.nextPath
    pageContext.pageDescription = this.route.pageDescription

    return this.showView({ h, pageContext })
  }
}
