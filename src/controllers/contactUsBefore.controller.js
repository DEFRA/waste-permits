'use strict'

const BaseController = require('./base.controller')

module.exports = class ContactUsBeforeController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }
}
