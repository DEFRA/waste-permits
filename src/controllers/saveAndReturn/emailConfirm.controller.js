'use strict'

const Routes = require('../../routes')
const BaseController = require('../base.controller')
const SaveAndReturn = require('../../models/taskList/saveAndReturn.task')
const RecoveryService = require('../../services/recovery.service')
const config = require('../../config/config')

module.exports = class EmailConfirmController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { applicationId, applicationLineId, application } = context

    const isComplete = await SaveAndReturn.isComplete(context, applicationId, applicationLineId)
    if (isComplete) {
      return this.redirect({ request, h, redirectPath: Routes.SAVE_AND_RETURN_SENT_CHECK.path })
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

      try {
        const origin = config.wastePermitsAppUrl || request.headers.origin
        await application.sendSaveAndReturnEmail(context, origin)
      } catch (err) {
        return this.doGet(request, h, this.setCustomError('custom.failed', 'save-and-return-email'))
      }

      return this.redirect({ request, h, redirectPath: Routes.SAVE_AND_RETURN_SENT_CHECK.path })
    }
  }
}
