'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class NotCompleteController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    pageContext.taskListRoute = Constants.Routes.TASK_LIST.path

    return this.showView(request, h, 'error/notComplete', pageContext)
  }
}
