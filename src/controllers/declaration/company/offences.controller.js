'use strict'

const DeclarationsController = require('../base/declarations.controller')

module.exports = class OffencesController extends DeclarationsController {
  getFormData (data) {
    return super.getFormData(data, 'relevantOffences', 'relevantOffencesDetails')
  }

  getRequestData (request) {
    return super.getRequestData(request, 'relevantOffences', 'relevantOffencesDetails')
  }

  getSpecificPageContext () {
    return {
      isOffences: true,
      declaredLabel: 'Yes, there are convictions to declare',
      noneDeclaredLabel: 'No',
      declarationDetailsLabel: 'Give details of the convictions',
      declarationDetailsHint: 'Include the names of the people or companies, the offences and penalties given'
    }
  }
}
