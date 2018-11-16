'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')
const SaveAndReturn = require('../../models/taskList/saveAndReturn.task')
const RecoveryService = require('../../services/recovery.service')

module.exports = class EnterEmailController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { application } = context

    const isComplete = await SaveAndReturn.isComplete(context)
    if (isComplete) {
      return this.redirect({ request, h, redirectPath: Routes.SAVE_AND_RETURN_COMPLETE.path })
    }

    if (request.payload) {
      // If we have Save and Return email in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'save-and-return-email': application.saveAndReturnEmail
      }
    }
    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { application } = context
      application.saveAndReturnEmail = request.payload['save-and-return-email']

      await application.save(context)

      return this.redirect({ request, h, redirectPath: Routes.SAVE_AND_RETURN_CONFIRM.path })
    }
  }
}
