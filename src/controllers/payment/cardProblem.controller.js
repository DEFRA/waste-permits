'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')

module.exports = class CardProblemController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    const {application} = await this.createApplicationContext(request, {application: true})

    if (!application.isSubmitted()) {
      return this.redirect(request, h, Constants.Routes.ERROR.NOT_SUBMITTED.path)
    }

    pageContext.urls = {
      cardPayment: Constants.Routes.PAYMENT.CARD_PAYMENT.path,
      bacsPayment: Constants.Routes.PAYMENT.BACS_PAYMENT.path
    }

    return this.showView(request, h, 'payment/cardProblem', pageContext)
  }
}