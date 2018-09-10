'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')

module.exports = class StartAtBeginningController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    pageContext.applyForPermitLink = Routes.START_OR_OPEN_SAVED.path

    return this.showView({ request, h, pageContext })
  }
}
