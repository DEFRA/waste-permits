'use strict'

const Constants = require('../constants')
const BaseDeclarationsController = require('./baseDeclarations.controller')
const DeclareOffencesValidator = require('../validators/declareOffences.validator')

module.exports = class DeclareOffencesController extends BaseDeclarationsController {
  constructor (...args) {
    super(...args)
    this.validator = DeclareOffencesValidator
    this.nextPath = Constants.Routes.COMPANY_DECLARE_BANKRUPTCY.path
  }

  getFormData (data) {
    if (!data) {
      return {}
    }
    return {
      'declaration-details': data.relevantOffencesDetails,
      'declared': data.relevantOffences ? 'yes' : (data.relevantOffences === false ? 'no' : '')
    }
  }

  getRequestData (request) {
    const relevantOffences = request.payload.declared === 'yes'
    const relevantOffencesDetails = relevantOffences ? request.payload['declaration-details'] : undefined
    return {relevantOffences, relevantOffencesDetails}
  }

  getSpecificPageContext () {
    return {
      declarationHint: `The <a target="_blank" rel="noopener noreferrer" href="https://www.gov.uk/government/publications/relevant-conviction-guidance-for-permit-applications-for-waste-activities-and-installations-only">relevant conviction guidance on GOV.UK (opens new tab)</a> gives a full list of people and offences you should include.`,
      declaredLabel: 'Yes, there are convictions to declare',
      noneDeclaredLabel: 'No',
      declarationDetailsLabel: 'Give details of the convictions',
      declarationDetailsHint: 'Include the names of the people or companies, the offences and penalties given'
    }
  }
}
