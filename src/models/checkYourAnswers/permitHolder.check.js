const Constants = require('../../constants')
const BaseCheck = require('./base.check')
const Utilities = require('../../utilities/utilities')
const {PERMIT_HOLDER_DETAILS: ruleSetId} = Constants.Dynamics.RulesetIds
const {LIMITED_LIABILITY_PARTNERSHIP} = Constants.Dynamics.PERMIT_HOLDER_TYPES

const {
  COMPANY_DECLARE_BANKRUPTCY,
  COMPANY_DECLARE_OFFENCES,
  COMPANY_DIRECTOR_EMAIL,
  COMPANY_NUMBER,
  DIRECTOR_DATE_OF_BIRTH,
  LLP_COMPANY_DESIGNATED_MEMBER_EMAIL,
  PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH,
  PERMIT_HOLDER_TYPE
} = require('../../routes')

const blankLine = {blankLine: true}

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
        this.getConvictionsLine(),
        this.getBankruptcyLine()
      ])
    }

    switch (await this.getPermitHolderType()) {
      case LIMITED_LIABILITY_PARTNERSHIP:
        // path = LLP_COMPANY_DESIGNATED_MEMBER_EMAIL.path
        // heading = 'Designated member email'
        // prefix = 'company-secretary-email'
        return Promise.all([
          this.getTypeLine(),
          this.getCompanyLine(),
          this.getDesignatedMemberEmailLine(),
          this.getConvictionsLine(),
          this.getBankruptcyLine()
        ])
      default:
      //   path = COMPANY_DIRECTOR_EMAIL.path
      //   heading = 'Company secretary or director email'
      //   prefix = 'designated-member-email'
        return Promise.all([
          this.getTypeLine(),
          this.getCompanyLine(),
          this.getDirectorsLine(),
          this.getCompanySecretaryEmailLine(),
          this.getConvictionsLine(),
          this.getBankruptcyLine()
        ])
    }
  }

  async getTypeLine () {
    const {path} = PERMIT_HOLDER_TYPE
    const {type} = await this.getPermitHolderType()
    return this.buildLine({
      heading: 'Permit holder type',
      prefix: 'type',
      answers: [type],
      links: [{path, type: 'permit holder'}]
    })
  }

  async getIndividualLine () {
    const {path} = PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH
    const {firstName = '', lastName = '', email = ''} = await this.getIndividualPermitHolder()
    const {dateOfBirth = 'unknown', telephone = 'unknown'} = await this.getIndividualPermitHolderDetails()
    const {tradingName = ''} = await this.getApplication()
    const [year, month, day] = dateOfBirth.split('-')
    const dob = {day, month, year}
    let answers = []
    answers.push(`${firstName} ${lastName}`)
    if (tradingName) {
      answers.push(`Trading as: ${tradingName}`)
    }
    answers.push(email)
    answers.push(`Telephone: ${telephone}`)
    answers.push(`Date of birth: ${Utilities.formatFullDateForDisplay(dob)}`)
    answers.push(blankLine)
    answers = answers.concat(await this.getPermitHolderAddressLine())
    return this.buildLine({
      heading: 'Permit holder',
      prefix: 'individual',
      answers,
      links: [{path, type: 'individual details'}]
    })
  }

  async getPermitHolderAddressLine () {
    const {
      buildingNameOrNumber = '',
      addressLine1 = '',
      addressLine2 = '',
      townOrCity = '',
      postcode = ''
    } = await this.getIndividualPermitHolderAddress()
    let firstLine = buildingNameOrNumber
    if (firstLine && addressLine1) {
      firstLine += ', '
    }
    firstLine += addressLine1
    return [firstLine, addressLine2, townOrCity, postcode]
  }

  async getCompanyLine () {
    const {path} = COMPANY_NUMBER
    const {companyNumber = ''} = await this.getCompanyAccount()
    const {name = '', address = ''} = await this.getCompany()
    const {useTradingName, tradingName = ''} = await this.getApplication()
    const answers = []
    answers.push(name)
    if (useTradingName) {
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

  async getDesignatedMemberEmailLine () {
    const {path} = LLP_COMPANY_DESIGNATED_MEMBER_EMAIL
    const {email = ''} = await this.getCompanySecretaryDetails()
    return this.buildLine({
      heading: 'Designated Member email',
      prefix: 'designated-member-email',
      answers: [email],
      links: [{path, type: 'designated member email'}]
    })
  }

  async getCompanySecretaryEmailLine () {
    const {path} = COMPANY_DIRECTOR_EMAIL
    const {email = ''} = await this.getCompanySecretaryDetails()
    return this.buildLine({
      heading: 'Company Secretary or director email',
      prefix: 'company-secretary-email',
      answers: [email],
      links: [{path, type: 'company secretary or director email'}]
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

  async getBankruptcyLine () {
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
