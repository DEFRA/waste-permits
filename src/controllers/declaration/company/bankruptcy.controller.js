'use strict'

const DeclarationsController = require('../base/declarations.controller')
const CompanyDetails = require('../../../models/taskList/companyDetails.model')

module.exports = class BankruptcyController extends DeclarationsController {
  get view () {
    return 'declaration/company/bankruptcy'
  }

  getFormData (data) {
    return super.getFormData(data, 'bankruptcy', 'bankruptcyDetails')
  }

  getRequestData (request) {
    return super.getRequestData(request, 'bankruptcy', 'bankruptcyDetails')
  }

  getSpecificPageContext () {
    return {
      isBankruptcy: true,
      declaredLabel: 'Yes, there are or were bankruptcy or insolvency proceedings',
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
