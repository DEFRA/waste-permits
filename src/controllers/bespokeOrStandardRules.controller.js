'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
// const { COOKIE_KEY } = require('../constants')
// const { PermitTypes } = require('../dynamics')
// const CookieService = require('../services/cookie.service')
// const RecoveryService = require('../services/recovery.service')
// const ApplicationLine = require('../models/applicationLine.model')

module.exports = class BespokeOrStandardRulesController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)

    pageContext.formValues = request.payload || request.query

    if (pageContext.formValues['permit-type']) {
      pageContext.selectedBespokePermitType = pageContext.formValues['permit-type'] === 'bespoke'
      pageContext.selectedStandardRulesPermitType = pageContext.formValues['permit-type'] === 'standard-rules'
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }

    const isBespoke = request.payload['permit-type'] === 'bespoke'

    if (isBespoke) {
      return this.redirect({ request, h, redirectPath: Routes.BESPOKE_APPLY_OFFLINE.path })
    } else {
      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }
}
