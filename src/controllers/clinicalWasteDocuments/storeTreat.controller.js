'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')
const StoreTreatModel = require('../../models/clinicalWasteDocuments/storeTreat.model')

const {
  CLINICAL_WASTE_DOCUMENTS_JUSTIFICATION_UPLOAD,
  CLINICAL_WASTE_DOCUMENTS_SUMMARY_UPLOAD
} = require('../../routes')

const YES = 'yes'

module.exports = class StoreTreatController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    const storeTreat = await StoreTreatModel.get(context)

    // we set a separate no variable as Handlebars only allow us to check whether a variable equates to true/false
    // which causes problems as we can't differentiate between 'store-treat is false' (ie. No was selected)
    // and 'store-treat is undefined' (ie. nothing has been selected yet)
    pageContext.formValues = {
      'store-treat': storeTreat.storeTreat,
      'store-treat-no': storeTreat.storeTreat === false
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const storeTreat = request.payload['store-treat'] === YES

    const storeTreatResponse = {
      storeTreat: storeTreat
    }

    const storeTreatModel = new StoreTreatModel(storeTreatResponse)
    await storeTreatModel.save(context)

    if (storeTreat) {
      return this.redirect({ h, route: CLINICAL_WASTE_DOCUMENTS_JUSTIFICATION_UPLOAD })
    } else {
      return this.redirect({ h, route: CLINICAL_WASTE_DOCUMENTS_SUMMARY_UPLOAD })
    }
  }
}
