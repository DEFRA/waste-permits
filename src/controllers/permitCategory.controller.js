'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PermitCategoryController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, h, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    pageContext.formValues = request.payload

    return this.showView(request, h, 'permitCategory', pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      return this.redirect(request, h, Constants.Routes.PERMIT_SELECT.path)
    }
  }
}
