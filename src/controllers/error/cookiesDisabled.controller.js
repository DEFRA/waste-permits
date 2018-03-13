'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class CookiesDisabledController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    pageContext.cookieInfoLink = Constants.Routes.COOKIES.path

    return this.showView(request, h, 'error/cookiesDisabled', pageContext)
  }
}
