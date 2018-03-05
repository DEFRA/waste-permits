'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class NotCompleteController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    pageContext.taskListRoute = Constants.Routes.TASK_LIST.path

    return reply
      .view('error/notComplete', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }
}
