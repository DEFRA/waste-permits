'use strict'

const BaseController = require('../base.controller')
const SaveAndReturn = require('../../models/taskList/saveAndReturn.model')
const RecoveryService = require('../../services/recovery.service')
const config = require('../../config/featureConfig')
const {SAVE_AND_RETURN_RECOVER, SAVE_AND_RETURN_SENT_RESENT, TASK_LIST} = require('../../routes')

module.exports = class EmailSentController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, {application: true, applicationReturn: true})
    const {applicationId, applicationLineId, application, applicationReturn} = context

    if (request.payload) {
      // If we have Save and Return email in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'save-and-return-email': application.saveAndReturnEmail
      }
    }
    pageContext.isComplete = await SaveAndReturn.isComplete(context, applicationId, applicationLineId)
    if (pageContext.isComplete) {
      pageContext.gotEmail = true
    }
    if (pageContext.formValues['got-email']) {
      if (pageContext.formValues['got-email'] === 'true') {
        pageContext.gotEmail = true
      } else {
        pageContext.notGotEmail = true
      }
    }

    if (config.hasDisplayRecoveryLinkFeature && applicationReturn.slug) {
      pageContext.recoveryLink = `${request.headers.origin || request.headers.host}${SAVE_AND_RETURN_RECOVER.path}/${applicationReturn.slug}`
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {applicationId, applicationLineId, application} = context

      if (request.payload['got-email']) {
        if (request.payload['got-email'] !== 'true') {
          application.saveAndReturnEmail = request.payload['save-and-return-email']
          await application.save(context)
          try {
            await application.sendSaveAndReturnEmail(context, request.headers.origin)
          } catch (err) {
            return this.doGet(request, h, this.setCustomError('custom.failed', 'save-and-return-email'))
          }
          return this.redirect({request, h, redirectPath: SAVE_AND_RETURN_SENT_RESENT.path})
        } else {
          await SaveAndReturn.updateCompleteness(context, applicationId, applicationLineId)
        }
      }

      return this.redirect({request, h, redirectPath: TASK_LIST.path})
    }
  }
}
