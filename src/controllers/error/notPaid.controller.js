'use strict'

// const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class NotPaidController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)

    // TODO: We don't know that the payment route is yet
    pageContext.payForApplicationRoute = 'UNKNOWN ROUTE'
    // pageContext.payForApplicationRoute = Constants.Routes.PAY_FOR_APPLICATION.path

    return this.showView(request, reply, 'error/notPaid', pageContext)
  }
}
