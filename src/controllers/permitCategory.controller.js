'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const PermitCategoryValidator = require('../validators/permitCategory.validator')

module.exports = class PermitCategoryController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new PermitCategoryValidator())

    pageContext.formValues = request.payload
    return reply.view('permitCategory', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // TODO persist the data here if required using the applicationId from the cookie
      return reply.redirect(Constants.Routes.PERMIT_SELECT.path)
    }
  }
}
