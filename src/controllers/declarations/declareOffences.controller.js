'use strict'

const BaseDeclarationsController = require('./baseDeclarations.controller')

module.exports = class DeclareOffencesController extends BaseDeclarationsController {
  getFormData (data) {
    return super.getFormData(data, 'relevantOffences', 'relevantOffencesDetails')
  }

  getRequestData (request) {
    return super.getRequestData(request, 'relevantOffences', 'relevantOffencesDetails')
  }

  getSpecificPageContext () {
    return {
      isDeclareOffences: true,
      declaredLabel: 'Yes, there are convictions to declare',
      noneDeclaredLabel: 'No',
      declarationDetailsLabel: 'Give details of the convictions',
      declarationDetailsHint: 'Include the names of the people or companies, the offences and penalties given'
    }
  }
}
