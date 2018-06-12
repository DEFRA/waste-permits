'use strict'

const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const RecoveryService = require('../../services/recovery.service')

const {
  COOKIE_KEY: {STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID},
  Dynamics: {PERMIT_HOLDER_TYPES},
  Routes: {APPLY_OFFLINE, PERMIT_CATEGORY}
} = require('../../constants')

module.exports = class PermitHolderTypeController extends BaseController {
  static getHolderTypes (application) {
    return Object.entries(PERMIT_HOLDER_TYPES)
      .map(([key, permitHolderType]) => {
        const isSelected = application && application.applicantType === permitHolderType.dynamicsApplicantTypeId && application.organisationType === permitHolderType.dynamicsOrganisationTypeId
        return Object.assign({isSelected}, permitHolderType)
      })
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await RecoveryService.createApplicationContext(h, {application: true})
    pageContext.holderTypes = PermitHolderTypeController.getHolderTypes(application)
    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {application} = context

      const permitHolder = PermitHolderTypeController.getHolderTypes()
        .filter(({id}) => request.payload['chosen-holder-type'] === id)
        .pop()

      CookieService.remove(request, STANDARD_RULE_ID)
      CookieService.remove(request, STANDARD_RULE_TYPE_ID)

      application.applicantType = permitHolder.dynamicsApplicantTypeId
      application.organisationType = permitHolder.dynamicsOrganisationTypeId
      if (application.organisationType) {
        application.permitHolderIndividualId = undefined
      } else {
        application.permitHolderOrganisationId = undefined
      }
      await application.save(context)

      if (permitHolder.canApplyOnline) {
        return this.redirect({request, h, redirectPath: PERMIT_CATEGORY.path})
      }

      return this.redirect({request, h, redirectPath: APPLY_OFFLINE.path})
    }
  }
}