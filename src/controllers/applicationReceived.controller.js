'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const Payment = require('../models/payment.model')

module.exports = class ApplicationReceivedController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const application = await Application.getById(authToken, applicationId)
    const bacsPayment = await Payment.getByApplicationLineIdAndType(authToken, applicationLineId, Constants.Dynamics.PaymentTypes.BACS_PAYMENT)

    pageContext.applicationName = application.applicationName

    if (bacsPayment || application.isPaidFor()) {
      return this.showView(request, reply, 'applicationReceived', pageContext)
    } else {
      // If bacs has not been selected for payment and the application has not been paid for
      return this.redirect(request, reply, Constants.Routes.ERROR.NOT_PAID.path)
    }
  }
}
