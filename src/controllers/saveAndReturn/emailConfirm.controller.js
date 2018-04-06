'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const SaveAndReturn = require('../../models/taskList/saveAndReturn.model')

module.exports = class EmailConfirmController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application, payment} = await this.createApplicationContext(request, {application: true, payment: true})

    const isComplete = await SaveAndReturn.isComplete(authToken, applicationId, applicationLineId)
    if (isComplete) {
      return this.redirect(request, h, Constants.Routes.SAVE_AND_RETURN_SENT_CHECK.path)
    }

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
    return this.showView(request, h, 'saveAndReturn/emailConfirm', pageContext)
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, application} = await this.createApplicationContext(request, {application: true})
      application.saveAndReturnEmail = request.payload['save-and-return-email']

      await application.save(authToken)

      try {
        await application.sendSaveAndReturnEmail(authToken, request.headers.origin)
      } catch (err) {
        return this.doGet(request, h, this.setCustomError('custom.failed', 'save-and-return-email'))
      }

      return this.redirect(request, h, Constants.Routes.SAVE_AND_RETURN_SENT_CHECK.path)
    }
  }
}
