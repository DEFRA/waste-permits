'use strict'

const BaseDeclarationsController = require('./baseDeclarations.controller')
const Confidentiality = require('../models/taskList/confidentiality.model')

module.exports = class ConfidentialityController extends BaseDeclarationsController {
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
      declarationDetailsHint: 'Check the guidance first to check you qualify'
    }
  }

  async updateCompleteness (...args) {
    await Confidentiality.updateCompleteness(...args)
  }
}
