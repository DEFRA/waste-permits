'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')

module.exports = class NotSubmittedController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    pageContext.checkYourAnswersRoute = Routes.CHECK_BEFORE_SENDING.path

    return this.showView({request, h, pageContext})
  }
}
