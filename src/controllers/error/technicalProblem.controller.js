'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class TechnicalProblemController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    return reply
      .view('error/technicalProblem', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }
}
