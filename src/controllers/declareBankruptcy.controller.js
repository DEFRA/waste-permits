'use strict'

const BaseDeclarationsController = require('./baseDeclarations.controller')
const CompanyDetails = require('../models/taskList/companyDetails.model')

module.exports = class DeclareBankruptcyController extends BaseDeclarationsController {
  getFormData (data) {
    return super.getFormData(data, 'bankruptcy', 'bankruptcyDetails')
  }

  getRequestData (request) {
    return super.getRequestData(request, 'bankruptcy', 'bankruptcyDetails')
  }

  getSpecificPageContext () {
    return {
      isDeclareBankruptcy: true,
      declaredLabel: 'Yes, there are bankruptcy or insolvency proceedings',
      noneDeclaredLabel: 'No',
      declarationDetailsLabel: 'Give details of the bankruptcy or insolvency',
      declarationDetailsHint: 'Include the dates for the proceedings',
      declarationNotice: 'We may contact a credit reference agency for a report about your business’s finances.'
    }
  }

  async updateCompleteness (...args) {
    await CompanyDetails.updateCompleteness(...args)
  }
}
