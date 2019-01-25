'use strict'

const BaseController = require('../../base.controller')
const Constants = require('../../../constants')
const RecoveryService = require('../../../services/recovery.service')

const { PERMIT_HOLDER_TYPES } = require('../../../dynamics')

module.exports = class DeclarationsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { application, permitHolderType, charityDetail } = await RecoveryService.createApplicationContext(h)

    switch (permitHolderType) {
      case PERMIT_HOLDER_TYPES.INDIVIDUAL:
      case PERMIT_HOLDER_TYPES.SOLE_TRADER:
        pageContext.operatorTypeIsIndividual = true
        break
      case PERMIT_HOLDER_TYPES.PARTNERSHIP:
        pageContext.operatorTypeIsPartnership = true
        break
      case PERMIT_HOLDER_TYPES.LIMITED_LIABILITY_PARTNERSHIP:
        pageContext.operatorTypeIsLimitedLiabilityPartnership = true
        break
      case PERMIT_HOLDER_TYPES.PUBLIC_BODY:
        pageContext.operatorTypeIsPublicBody = true
        break
      case PERMIT_HOLDER_TYPES.OTHER_ORGANISATION:
        pageContext.operatorTypeIsOther = true
        break
      default:
        pageContext.operatorTypeIsLimitedCompany = true
    }

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = this.getFormData(application, pageContext)
    }

    pageContext.declared = (pageContext.formValues.declared === 'yes')
    pageContext.noneDeclared = (pageContext.formValues.declared === 'no')
    pageContext.declaredDetailsMaxLength = this.validator.getDeclaredDetailsMaxLength().toLocaleString()

    if (charityDetail && charityDetail.charityPermitHolder && this.route.pageHeadingCharity) {
      pageContext.pageHeading = this.route.pageHeadingCharity
      pageContext.pageTitle = Constants.buildPageTitle(this.route.pageHeadingCharity)
    }

    Object.assign(pageContext, this.getSpecificPageContext())

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context

    Object.assign(application, this.getRequestData(request))
    await application.save(context)

    return this.redirect({ h })
  }

  getFormData (data, declared, declarationDetails) {
    if (!data) {
      return {}
    }
    return {
      'declaration-details': data[declarationDetails],
      'declared': data[declared] ? 'yes' : (data[declared] === false ? 'no' : '')
    }
  }

  getRequestData (request, declared, declarationDetails) {
    const data = {}
    data[declared] = request.payload.declared === 'yes'
    data[declarationDetails] = data[declared] ? request.payload['declaration-details'] : undefined
    return data
  }
}
