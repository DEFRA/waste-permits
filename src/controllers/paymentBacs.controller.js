'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const ApplicationLine = require('../models/applicationLine.model')
const Payment = require('../models/payment.model')

module.exports = class PaymentBacsController extends BaseController {
  async doGet (request, reply) {
    const pageContext = this.createPageContext()
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    return this.showView(request, reply, 'paymentBacs', pageContext)
  }

  async doPost (request, reply) {
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const payment = await Payment.getBacsPaymentDetails(authToken, applicationLineId)
    const {value = 0} = await ApplicationLine.getById(authToken, applicationLineId)
    payment.value = value
    payment.category = Constants.Dynamics.PAYMENT_CATEGORY
    payment.statusCode = Constants.Dynamics.PaymentStatusCodes.ISSUED
    await payment.save(authToken)

    return this.redirect(request, reply, Constants.Routes.APPLICATION_RECEIVED.path)
  }
}
