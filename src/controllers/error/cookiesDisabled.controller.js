'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')

module.exports = class CookiesDisabledController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    pageContext.cookieInfoLink = Routes.COOKIES.path

    return this.showView({ h, pageContext })
  }
}
