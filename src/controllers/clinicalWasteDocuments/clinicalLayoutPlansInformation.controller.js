'use strict'

const BaseController = require('../base.controller')
const { COOKIES } = require('../../routes')

module.exports = class ClinicalLayoutPlansInformationController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    pageContext.cookieRoute = COOKIES.path
    return this.showView({ h, pageContext })
  }
}
