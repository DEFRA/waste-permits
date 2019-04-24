'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const { MCP_TYPES, PERMIT_HOLDER_TYPES } = require('../../dynamics')
const { PERMIT_HOLDER_DETAILS } = require('../../routes')
const { MOBILE_GENERATOR_0_TO_20_MW } = require('../../constants').PermitTypes.STANDARD_RULES

const mcpTypes = Object.values(MCP_TYPES)

module.exports = class PermitHolderTypeController extends BaseController {
  static getHolderTypes (application, charityPermitHolder) {
    const permitHolderTypes = Object.values(PERMIT_HOLDER_TYPES)
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
    const { application, charityDetail = {}, standardRule = {}, mcpType = {} } = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const isMobile = Boolean(mcpTypes.find(({ id, isMobile }) => mcpType.id === id && isMobile))
    pageContext.mobileGenerator = isMobile || standardRule.code === MOBILE_GENERATOR_0_TO_20_MW
    pageContext.holderTypes = PermitHolderTypeController.getHolderTypes(application, charityDetail.charityPermitHolder)
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application, charityDetail = {} } = context

    const holderTypes = PermitHolderTypeController.getHolderTypes(application, charityDetail.charityPermitHolder)

    const permitHolder = holderTypes.find(({ id }) => request.payload['chosen-holder-type'] === id)

    application.applicantType = permitHolder.dynamicsApplicantTypeId
    application.organisationType = permitHolder.dynamicsOrganisationTypeId
    application.permitHolderOrganisationId = undefined
    application.permitHolderIndividualId = undefined
    await application.save(context)
    if (charityDetail.charityPermitHolder) {
      await charityDetail.delete(context)
    }

    return this.redirect({ h, route: PERMIT_HOLDER_DETAILS })
  }
}
