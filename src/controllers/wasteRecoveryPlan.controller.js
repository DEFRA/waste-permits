'use strict'

const BaseController = require('./base.controller')

module.exports = class WasteRecoveryPlanController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect({request, h, redirectPath})
    }

    pageContext.formValues = request.payload
    return this.showView({request, h, viewPath: 'wasteRecoveryPlan', pageContext})
  }

  async doPost (request, h, errors) {
    // Not implemented yet
    return this.doGet(request, h, errors)
  }
}
