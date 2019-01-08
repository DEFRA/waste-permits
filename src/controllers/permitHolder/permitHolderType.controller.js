'use strict'

const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const RecoveryService = require('../../services/recovery.service')

const { COOKIE_KEY: { STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID } } = require('../../constants')
const { PERMIT_HOLDER_TYPES } = require('../../dynamics')
const { APPLY_OFFLINE, PERMIT_CATEGORY } = require('../../routes')

module.exports = class PermitHolderTypeController extends BaseController {
  static getHolderTypes (application) {
    return Object.entries(PERMIT_HOLDER_TYPES)
      .map(([key, permitHolderType]) => {
        const isSelected = application && application.applicantType === permitHolderType.dynamicsApplicantTypeId && application.organisationType === permitHolderType.dynamicsOrganisationTypeId
        return Object.assign({ isSelected }, permitHolderType)
      })
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })
    pageContext.holderTypes = PermitHolderTypeController.getHolderTypes(application)
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { application } = context

    const permitHolder = PermitHolderTypeController.getHolderTypes()
      .find(({ id }) => request.payload['chosen-holder-type'] === id)

    CookieService.remove(request, STANDARD_RULE_ID)
    CookieService.remove(request, STANDARD_RULE_TYPE_ID)

    application.applicantType = permitHolder.dynamicsApplicantTypeId
    application.organisationType = permitHolder.dynamicsOrganisationTypeId
    application.permitHolderOrganisationId = undefined
    application.permitHolderIndividualId = undefined

    await application.save(context)

    if (permitHolder.canApplyOnline) {
      return this.redirect({ h, route: PERMIT_CATEGORY })
    }

    return this.redirect({ h, route: APPLY_OFFLINE })
  }
}
