'use strict'

const Constants = require('../constants')
const BaseDeclarationsController = require('./baseDeclarations.controller')
const DeclareBankruptcyValidator = require('../validators/declareBankruptcy.validator')

module.exports = class DeclareBankruptcyController extends BaseDeclarationsController {
  constructor (...args) {
    super(...args)
    this.validator = DeclareBankruptcyValidator
    this.nextPath = Constants.Routes.TASK_LIST.path
  }

  getFormData (data) {
    if (!data) {
      return {}
    }
    return {
      'declaration-details': data.bankruptcyDetails,
      'declared': data.bankruptcy ? 'yes' : (data.bankruptcy === false ? 'no' : '')
    }
  }

  getRequestData (request) {
    const bankruptcy = request.payload.declared === 'yes'
    const bankruptcyDetails = bankruptcy ? request.payload['declaration-details'] : undefined
    return {bankruptcy, bankruptcyDetails}
  }

  getSpecificPageContext () {
    return {
      declaredLabel: 'Yes, there are bankruptcy or insolvency proceedings',
      noneDeclaredLabel: 'No',
      declarationDetailsLabel: 'Give details of the bankruptcy or insolvency',
      declarationDetailsHint: 'Include the dates for the proceedings',
      declarationNotice: 'We may contact a credit reference agency for a report about your business’s finances.'
    }
  }
}
