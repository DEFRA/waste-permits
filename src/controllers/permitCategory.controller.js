'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PermitCategoryController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.formValues = request.payload

    return this.showView(request, reply, 'permitCategory', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      return this.redirect(request, reply, Constants.Routes.PERMIT_SELECT.path)
    }
  }
}
