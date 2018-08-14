'use strict'

const BaseController = require('./base.controller')
const {COOKIES} = require('../routes')

module.exports = class PrivacyController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    pageContext.cookieRoute = COOKIES.path
    return this.showView({request, h, pageContext})
  }
}
