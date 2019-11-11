'use strict'

const DeclarationsController = require('../base/declarations.controller')
const Confidentiality = require('../../../models/taskList/confidentiality.task')

module.exports = class ConfidentialityController extends DeclarationsController {
  getFormData (data) {
    return super.getFormData(data, 'confidentiality', 'confidentialityDetails')
  }

  getRequestData (request) {
    return super.getRequestData(request, 'confidentiality', 'confidentialityDetails')
  }

  getSpecificPageContext () {
    return {
      isConfidentiality: true,
      declaredLabel: 'Yes, I want to claim confidentiality for part of my application',
      noneDeclaredLabel: 'No',
      declarationDetailsLabel: 'What information do you think is confidential, and why?',
      declarationDetailsHint: 'Read the guidance to make sure your information qualifies'
    }
  }

  async updateCompleteness (context) {
    return Confidentiality.updateCompleteness(context)
  }
}
