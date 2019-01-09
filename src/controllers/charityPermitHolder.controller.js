'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const CharityDetail = require('../models/charityDetail.model')
const { INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY } = require('../dynamics').PERMIT_HOLDER_TYPES

module.exports = class CharityPermitHolderController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    if (errors) {
      pageContext.formValues = request.payload
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const { charityPermitHolder } = await CharityDetail.get(context)
      pageContext.formValues = {
        'charity-permit-holder-type': charityPermitHolder
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

    const charityPermitHolder = request.payload['charity-permit-holder-type']

    const charityDetail = await CharityDetail.get(context)
    Object.assign(charityDetail, { charityPermitHolder })

    await charityDetail.save(context)
    return this.redirect({ h })
  }
}
