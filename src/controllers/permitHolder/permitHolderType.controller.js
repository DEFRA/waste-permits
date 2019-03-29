'use strict'

const BaseController = require('../base.controller')
const CookieService = require('../../services/cookie.service')
const RecoveryService = require('../../services/recovery.service')

const { COOKIE_KEY: { STANDARD_RULE_ID, STANDARD_RULE_TYPE_ID } } = require('../../constants')
const { PERMIT_HOLDER_TYPES } = require('../../dynamics')
const { APPLY_OFFLINE, PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH } = require('../../routes')

module.exports = class PermitHolderTypeController extends BaseController {
  static getHolderTypes (application, charityPermitHolder) {
    const permitHolderTypes = Object.entries(PERMIT_HOLDER_TYPES).map(([key, permitHolderType]) => Object.assign({}, permitHolderType))
    let selectedPermitHolderType
    if (application) {
      if (charityPermitHolder) {
        selectedPermitHolderType = permitHolderTypes.find(({ id }) => id === PERMIT_HOLDER_TYPES.CHARITY_OR_TRUST.id)
      } else {
        const { applicantType, organisationType } = application
        selectedPermitHolderType = permitHolderTypes.find(({ dynamicsApplicantTypeId, dynamicsOrganisationTypeId }) =>
          dynamicsApplicantTypeId === applicantType && dynamicsOrganisationTypeId === organisationType)
      }
    }
    if (selectedPermitHolderType) {
      selectedPermitHolderType.isSelected = true
    }
    return permitHolderTypes
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { application, charityDetail = {} } = await RecoveryService.createApplicationContext(h)
    pageContext.holderTypes = PermitHolderTypeController.getHolderTypes(application, charityDetail.charityPermitHolder)
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application, charityDetail = {} } = context

    const holderTypes = PermitHolderTypeController.getHolderTypes(application, charityDetail.charityPermitHolder)

    const permitHolder = holderTypes.find(({ id }) => request.payload['chosen-holder-type'] === id)

    CookieService.remove(request, STANDARD_RULE_ID)
    CookieService.remove(request, STANDARD_RULE_TYPE_ID)

    application.applicantType = permitHolder.dynamicsApplicantTypeId
    application.organisationType = permitHolder.dynamicsOrganisationTypeId
    application.permitHolderOrganisationId = undefined
    application.permitHolderIndividualId = undefined
    await application.save(context)
    if (charityDetail.charityPermitHolder) {
      await charityDetail.delete(context)
    }

    if (permitHolder.canApplyOnline) {
      return this.redirect({ h, route: PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH })
    }

    return this.redirect({ h, route: APPLY_OFFLINE })
  }
}
