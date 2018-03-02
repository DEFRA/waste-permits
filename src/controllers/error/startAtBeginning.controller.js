'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class StartAtBeginningController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    pageContext.applyForPermitLink = Constants.Routes.START_OR_OPEN_SAVED.path

    return reply
      .view('error/startAtBeginning', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }
}
