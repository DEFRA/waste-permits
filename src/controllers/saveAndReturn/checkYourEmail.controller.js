'use strict'

const Constants = require('../../constants')
const Routes = require('../../routes')
const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const RecoveryService = require('../../services/recovery.service')
const Application = require('../../persistence/entities/application.entity')
const config = require('../../config/config')

module.exports = class CheckYourEmailController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.formValues = request.payload || {}
    pageContext.email = CookieService.get(request, Constants.COOKIE_KEY.SAVE_AND_RETURN_EMAIL)
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const saveAndReturnEmail = request.payload['save-and-return-email']
    try {
      const origin = config.wastePermitsAppUrl || request.headers.origin
      const totalSent = await Application.sendAllRecoveryEmails(context, origin, saveAndReturnEmail)
      if (totalSent === 0) {
        return this.doGet(request, h, this.setCustomError('custom.missing', 'save-and-return-email'))
      }
    } catch (err) {
      return this.doGet(request, h, this.setCustomError('custom.failed', 'save-and-return-email'))
    }
    CookieService.set(request, Constants.COOKIE_KEY.SAVE_AND_RETURN_EMAIL, saveAndReturnEmail)
    return this.redirect({ h, route: Routes.CHECK_YOUR_EMAIL })
  }
}
