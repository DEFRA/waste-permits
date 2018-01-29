'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class ApplicationSentController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    pageContext.selectPermitLink = Constants.Routes.PERMIT_SELECT.path
    return reply
      .view('applicationSent', pageContext)
  }
}
