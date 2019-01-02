'use strict'

const config = require('../../config/config')
const Routes = require('../../routes')
const BaseController = require('../base.controller')

module.exports = class TimeoutController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.startAgainLink = Routes.START_OR_OPEN_SAVED.path
    pageContext.cookieTimeout = config.cookieTimeout / (1000 * 60 * 60)

    return this.showView({ h, pageContext })
  }
}
