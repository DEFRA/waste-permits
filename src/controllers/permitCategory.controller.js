'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PermitCategoryController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
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
