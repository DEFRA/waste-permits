'use strict'

const {PERMIT_HOLDER_TYPES} = require('../../../constants')
const BaseController = require('../../base.controller')
const RecoveryService = require('../../../services/recovery.service')

module.exports = class DeclarationsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application, permitHolderType} = await RecoveryService.createApplicationContext(h, {application: true})

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

    Object.assign(pageContext, this.getSpecificPageContext())

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {applicationId, applicationLineId, application} = context

      Object.assign(application, this.getRequestData(request))
      await application.save(context)
      if (this.updateCompleteness) {
        await this.updateCompleteness(context, applicationId, applicationLineId)
      }

      return this.redirect({request, h, redirectPath: this.nextPath})
    }
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
