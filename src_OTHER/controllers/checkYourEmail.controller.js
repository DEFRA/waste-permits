'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CheckYourEmailValidator = require('../validators/checkYourEmail.validator')

module.exports = class CheckYourEmailController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new CheckYourEmailValidator())

    pageContext.formValues = request.payload
    return reply.view('checkYourEmail', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required using the applicationId from the cookie

      return reply.redirect(Constants.Routes.CONTACT.path)
    }
  }
}
