const Constants = require('../../constants')
const BaseCheck = require('./base.check')
const Utilities = require('../../utilities/utilities')
const {PERMIT_HOLDER_DETAILS: ruleSetId} = Constants.Dynamics.RulesetIds

const {COMPANY_DECLARE_BANKRUPTCY, COMPANY_DECLARE_OFFENCES, COMPANY_NUMBER, DIRECTOR_DATE_OF_BIRTH, PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH, PERMIT_HOLDER_TYPE} = Constants.Routes

module.exports = class PermitHolderCheck extends BaseCheck {
  static get rulesetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-permit-holder`
  }

  async buildLines () {
    const {isIndividual} = await this.getApplication()

    if (isIndividual) {
      return Promise.all([
        this.getTypeLine(),
        this.getIndividualLine(),
        this.getConvictionsLine(isIndividual),
        this.getBancruptcyLine(isIndividual)
      ])
    }

    return Promise.all([
      this.getTypeLine(),
      this.getCompanyLine(),
      this.getDirectorsLine(),
      this.getConvictionsLine(),
      this.getBancruptcyLine()
    ])
  }

  async getTypeLine () {
    const {path} = PERMIT_HOLDER_TYPE
    const {applicantType = ''} = await this.getApplication()
    const type = Object.entries(Constants.PERMIT_HOLDER_TYPES)
      .filter(([key, {dynamicsApplicantTypeId}]) => dynamicsApplicantTypeId === applicantType)
      .map(([key, {type}]) => type)
      .pop()
    return this.buildLine({
      heading: 'Permit holder type',
      prefix: 'type',
      answers: [type],
      links: [{path, type: 'permit holder'}]
    })
  }

  async getIndividualLine () {
    const {path} = PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH
    const {firstName = '', lastName = '', email = '', telephone = 'unknown'} = await this.getIndividualPermitHolder()
    const {dateOfBirth = 'unknown'} = await this.getIndividualPermitHolderDetails()
    const [year, month, day] = dateOfBirth.split('-')
    const dob = {day, month, year}
    const answers = []
    answers.push(`${firstName} ${lastName}`)
    answers.push(email)
    answers.push(`Telephone: ${telephone}`)
    answers.push(`Date of birth: ${Utilities.formatFullDateForDisplay(dob)}`)
    return this.buildLine({
      heading: 'Permit holder',
      prefix: 'individual',
      answers,
      links: [{path, type: 'individual details'}]
    })
  }

  async getCompanyLine () {
    const {path} = COMPANY_NUMBER
    const {companyNumber = ''} = await this.getCompanyAccount()
    const {name = '', address = ''} = await this.getCompany()
    const {tradingName = ''} = await this.getApplication()
    const answers = []
    answers.push(name)
    if (tradingName) {
      answers.push(`Trading as: ${tradingName}`)
    }
    answers.push(address)
    answers.push(`Company number: ${companyNumber}`)
    return this.buildLine({
      heading: 'Permit holder',
      prefix: 'company',
      answers,
      links: [{path, type: 'company details'}]
    })
  }

  async getDirectorsLine () {
    const {path} = DIRECTOR_DATE_OF_BIRTH
    const {companyNumber = ''} = await this.getCompanyAccount()
    // Only load the directors if the company has been entered
    const directors = companyNumber ? await this.getDirectors() : []
    const answers = directors.map(({firstName, lastName, dob}) => `${firstName} ${lastName}: ${Utilities.formatFullDateForDisplay(dob)}`)
    return this.buildLine({
      heading: `Directors' dates of birth`,
      prefix: 'director',
      answers: answers,
      links: [{path, type: `director's date of birth`}]
    })
  }

  async getConvictionsLine (isIndividual) {
    const {path} = COMPANY_DECLARE_OFFENCES
    const {relevantOffences = false, relevantOffencesDetails = ''} = await this.getApplication()
    const answers = []
    if (relevantOffences) {
      answers.push('You have declared these convictions:')
      relevantOffencesDetails.split('\n').forEach((detail) => answers.push(detail))
    } else {
      answers.push('No convictions to declare')
    }
    return this.buildLine({
      heading: 'Convictions',
      prefix: 'convictions',
      answers,
      links: [{path, type: 'offences'}]
    })
  }

  async getBancruptcyLine (isIndividual) {
    const {path} = COMPANY_DECLARE_BANKRUPTCY
    const {bankruptcy = false, bankruptcyDetails = ''} = await this.getApplication()
    const answers = []
    if (bankruptcy) {
      answers.push('You have declared these bankruptcy or insolvency proceedings:')
      bankruptcyDetails.split('\n').forEach((detail) => answers.push(detail))
    } else {
      answers.push('No bankruptcy or insolvency proceedings')
    }
    return this.buildLine({
      heading: 'Bankruptcy or insolvency',
      prefix: 'bankruptcy-or-insolvency',
      answers,
      links: [{path, type: 'bankruptcy or insolvency'}]
    })
  }
}
