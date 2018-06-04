'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const {PERMIT_HOLDER_TYPES} = Constants

module.exports = class PermitHolderTypeController extends BaseController {
  static getHolderTypes (application) {
    return Object.entries(PERMIT_HOLDER_TYPES)
      .map(([key, permitHolderType]) => {
        return Object.assign({}, permitHolderType, {selected: application && application.applicantType === permitHolderType.dynamicsApplicantTypeId && application.organisationType === permitHolderType.dynamicsOrganisationTypeId})
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
      const {STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID} = Constants.COOKIE_KEY

      CookieService.remove(request, STANDARD_RULE_ID)
      CookieService.remove(request, STANDARD_RULE_TYPE_ID)

      application.applicantType = permitHolder.dynamicsApplicantTypeId
      application.organisationType = permitHolder.dynamicsOrganisationTypeId
      if (application.organisationType) {
        application.permitHolderIndividualId = undefined
      } else {
        application.accountId = undefined
      }
      await application.save(context)

      if (permitHolder.canApplyOnline) {
        return this.redirect({request, h, redirectPath: Constants.Routes.PERMIT_CATEGORY.path})
      }

      return this.redirect({request, h, redirectPath: Constants.Routes.APPLY_OFFLINE.path})
    }
  }
}
