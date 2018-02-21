'use strict'

const config = require('../../config/config')
const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class TimeoutController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.startAgainLink = Constants.Routes.START_OR_OPEN_SAVED.path
    pageContext.cookieTimeout = config.cookieTimeout / (1000 * 60 * 60)

    return reply.view('error/timeout', pageContext)
  }
}