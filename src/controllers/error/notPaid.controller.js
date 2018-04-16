'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class NotPaidController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.payForApplicationRoute = Constants.Routes.PAYMENT.PAYMENT_TYPE.path

    return this.showView(request, h, 'error/notPaid', pageContext)
  }
}
