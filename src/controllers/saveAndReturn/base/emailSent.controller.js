'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')

module.exports = class EmailSentController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    if (request.payload) {
      // If we have Save and Return email in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'save-and-return-email': application.saveAndReturnEmail
      }
    }
    return this.showView(request, h, this.view, pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId, applicationLineId, application} = await this.createApplicationContext(request, {application: true})
      application.saveAndReturnEmail = request.payload['save-and-return-email']

      await application.save(authToken)

      if (this.updateCompleteness) {
        await this.updateCompleteness(authToken, applicationId, applicationLineId)
      }

      return this.redirect(request, h, Constants.Routes.TASK_LIST.path)
    }
  }
}
