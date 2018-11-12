'use strict'

const BaseController = require('../base.controller')
const SaveAndReturn = require('../../models/taskList/saveAndReturn.task')
const RecoveryService = require('../../services/recovery.service')
const featureConfig = require('../../config/featureConfig')
const config = require('../../config/config')
const { SAVE_AND_RETURN_RECOVER, SAVE_AND_RETURN_SENT_CHECK, SAVE_AND_RETURN_SENT_RESENT, TASK_LIST } = require('../../routes')

module.exports = class EmailSentController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h, { application: true, applicationReturn: true })
    const { applicationId, applicationLineId, application, applicationReturn } = context

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

    if (this.path === SAVE_AND_RETURN_SENT_CHECK.path) {
      pageContext.firstTime = true
    }

    if (featureConfig.hasDisplayRecoveryLinkFeature && applicationReturn.slug) {
      const origin = config.wastePermitsAppUrl || request.headers.origin
      pageContext.recoveryLink = `${origin}${SAVE_AND_RETURN_RECOVER.path}/${applicationReturn.slug}`
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { application } = context

      if (request.payload['got-email']) {
        if (request.payload['got-email'] !== 'true') {
          application.saveAndReturnEmail = request.payload['save-and-return-email']
          await application.save(context)
          try {
            const origin = config.wastePermitsAppUrl || request.headers.origin
            await application.sendSaveAndReturnEmail(context, origin)
          } catch (err) {
            return this.doGet(request, h, this.setCustomError('custom.failed', 'save-and-return-email'))
          }
          return this.redirect({ request, h, redirectPath: SAVE_AND_RETURN_SENT_RESENT.path })
        }
      }

      return this.redirect({ request, h, redirectPath: TASK_LIST.path })
    }
  }
}
