const Constants = require('../../constants')
const BaseCheck = require('./base.check')
const Utilities = require('../../utilities/utilities')
const {PERMIT_HOLDER_DETAILS: ruleSetId} = Constants.Dynamics.RulesetIds

const {COMPANY_NUMBER, DIRECTOR_DATE_OF_BIRTH, COMPANY_DECLARE_OFFENCES, COMPANY_DECLARE_BANKRUPTCY} = Constants.Routes

module.exports = class PermitHolderCheck extends BaseCheck {
  static get rulesetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-permit-holder`
  }

  async buildLines () {
    return Promise.all([
      this.getCompanyLine(),
      this.getDirectorsLine(),
      this.getConvictionsLine(),
      this.getBancruptcyLine()
    ])
  }

  async getCompanyLine () {
    // For MVP the route for this task list item is different,
    // we will go straight to the Company Details pathway instead.
    const {path} = COMPANY_NUMBER
    // const {path} = PERMIT_HOLDER
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
      links: [{path, type: 'permit holder'}]
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

  async getConvictionsLine () {
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

  async getBancruptcyLine () {
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
