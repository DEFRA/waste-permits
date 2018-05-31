'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const RecoveryService = require('../../services/recovery.service')
const Application = require('../../models/application.model')

module.exports = class CheckYourEmailController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)

    pageContext.formValues = request.payload || {}
    pageContext.email = CookieService.get(request, Constants.COOKIE_KEY.SAVE_AND_RETURN_EMAIL)
    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const saveAndReturnEmail = request.payload['save-and-return-email']
      try {
        const totalSent = await Application.sendAllRecoveryEmails(context, request.headers.origin, saveAndReturnEmail)
        if (totalSent === 0) {
          return this.doGet(request, h, this.setCustomError('custom.missing', 'save-and-return-email'))
        }
      } catch (err) {
        return this.doGet(request, h, this.setCustomError('custom.failed', 'save-and-return-email'))
      }
      CookieService.set(request, Constants.COOKIE_KEY.SAVE_AND_RETURN_EMAIL, saveAndReturnEmail)
      return this.redirect({request, h, redirectPath: Constants.Routes.CHECK_YOUR_EMAIL.path})
    }
  }
}
