'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY } = require('../dynamics').PERMIT_HOLDER_TYPES

module.exports = class CharityPermitHolderController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (errors) {
      pageContext.formValues = request.payload
    } else {
      const { charityDetail } = await RecoveryService.createApplicationContext(h)
      pageContext.formValues = {
        'charity-permit-holder-type': charityDetail.charityPermitHolder
      }
    }

    switch (pageContext.formValues['charity-permit-holder-type']) {
      case LIMITED_COMPANY.id:
        pageContext.selectedRegisteredCompanyType = true
        break
      case INDIVIDUAL.id:
        pageContext.selectedIndividualType = true
        break
      case PUBLIC_BODY.id:
        pageContext.selectedLegalBodyType = true
        break
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application, charityDetail } = context

    const charityPermitHolder = request.payload['charity-permit-holder-type']

    if (charityDetail.charityPermitHolder !== charityPermitHolder) {
      charityDetail.charityPermitHolder = charityPermitHolder
      application.permitHolderOrganisationId = undefined
      application.permitHolderIndividualId = undefined
      await charityDetail.save(context)
    }

    return this.redirect({ h })
  }
}
