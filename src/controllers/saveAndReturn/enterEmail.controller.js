'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const SaveAndReturn = require('../../models/taskList/saveAndReturn.model')
const RecoveryService = require('../../services/recovery.service')

module.exports = class EnterEmailController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application} = await RecoveryService.createApplicationContext(h, {application: true})

    const isComplete = await SaveAndReturn.isComplete(authToken, applicationId, applicationLineId)
    if (isComplete) {
      return this.redirect({request, h, redirectPath: Constants.Routes.SAVE_AND_RETURN_COMPLETE.path})
    }

    if (request.payload) {
      // If we have Save and Return email in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'save-and-return-email': application.saveAndReturnEmail
      }
    }
    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, application} = await RecoveryService.createApplicationContext(h, {application: true})
      application.saveAndReturnEmail = request.payload['save-and-return-email']

      await application.save(authToken)

      return this.redirect({request, h, redirectPath: Constants.Routes.SAVE_AND_RETURN_CONFIRM.path})
    }
  }
}
