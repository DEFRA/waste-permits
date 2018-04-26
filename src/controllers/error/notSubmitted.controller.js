'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class NotSubmittedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    pageContext.checkYourAnswersRoute = Constants.Routes.CHECK_BEFORE_SENDING.path

    return this.showView({request, h, pageContext})
  }
}
