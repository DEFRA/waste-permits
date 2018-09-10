'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')

module.exports = class NotPaidController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    pageContext.payForApplicationRoute = Routes.PAYMENT_TYPE.path

    return this.showView({ request, h, pageContext })
  }
}
