'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const ClinicalWasteDocumentsMeetStandardsModel = require('../../models/clinicalWasteDocumentsMeetStandards.model')

const YES = 'yes'

module.exports = class ClinicalWasteDocumentsMeetStandardsController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    const meetStandards = await ClinicalWasteDocumentsMeetStandardsModel.get(context)

    // we set a separate no variable as Handlebars only allow us to check whether a variable equates to true/false
    // which causes problems as we can't differentiate between 'meet-standards is false' (ie. No was selected)
    // and 'meet-standards is undefined' (ie. nothing has been selected yet)
    pageContext.formValues = {
      'meet-standards': meetStandards.clinicalWasteDocumentsMeetStandards,
      'meet-standards-no': meetStandards.clinicalWasteDocumentsMeetStandards === false
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const meetStandards = request.payload['meet-standards'] === YES

    const meetStandardsResponse = {
      meetStandards: meetStandards
    }

    const clinicalWasteDocumentsMeetStandardsModel = new ClinicalWasteDocumentsMeetStandardsModel(meetStandardsResponse)
    await clinicalWasteDocumentsMeetStandardsModel.save(context)

    if (meetStandards) {
      console.log('YES')
      return this.redirect({ h })
      // return this.redirect({ h, route: MAINTAIN_APPLICATION_LINES })
    } else {
      console.log('NO')
      return this.redirect({ h })
    }
  }
}
