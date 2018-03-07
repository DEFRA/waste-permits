'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const Application = require('../models/application.model')
const ApplicationLine = require('../models/applicationLine.model')
const {CARD_PAYMENT, BACS_PAYMENT} = Constants.Dynamics.PaymentTypes

module.exports = class PaymentTypeController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.get(request, Constants.COOKIE_KEY.AUTH_TOKEN)
    const applicationId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_ID)
    const applicationLineId = CookieService.get(request, Constants.COOKIE_KEY.APPLICATION_LINE_ID)
    const application = await Application.getById(authToken, applicationId)

    if (application.isSubmitted()) {
      return reply
        .redirect(Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
    }

    Object.assign(pageContext.formValues, {
      'card-payment': CARD_PAYMENT,
      'bacs-payment': BACS_PAYMENT
    })

    // Default to 0 when the balance hasn't been set
    const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
    const {value = 0} = applicationLine

    pageContext.cost = value.toLocaleString()

    return reply
      .view('paymentType', pageContext)
      .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
  }

  async doPost (request, reply, errors) {
    // Not implemented yet
    let nextPath
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const paymentType = parseInt(request.payload['payment-type'])
      switch (paymentType) {
        case CARD_PAYMENT:
          nextPath = Constants.Routes.CARD_PAYMENT.path
          break
        case BACS_PAYMENT:
          nextPath = Constants.Routes.BACS_PAYMENT.path
          break
        default:
          throw new Error(`Unexpected payment type (${paymentType})`)
      }
      return reply
        .redirect(nextPath)
        .state(Constants.DEFRA_COOKIE_KEY, request.state[Constants.DEFRA_COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }
}
