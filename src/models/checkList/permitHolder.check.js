const Dynamics = require('../../dynamics')
const BaseCheck = require('./base.check')
const Utilities = require('../../utilities/utilities')
const { PERMIT_HOLDER_DETAILS: ruleSetId } = require('../taskList/taskList').RuleSetIds
const { LIMITED_LIABILITY_PARTNERSHIP, PARTNERSHIP, PUBLIC_BODY } = Dynamics.PERMIT_HOLDER_TYPES

const {
  COMPANY_DECLARE_BANKRUPTCY,
  COMPANY_DECLARE_OFFENCES,
  COMPANY_DIRECTOR_EMAIL,
  COMPANY_NUMBER,
  DIRECTOR_DATE_OF_BIRTH,
  LLP_COMPANY_DESIGNATED_MEMBER_EMAIL,
  LLP_MEMBER_DATE_OF_BIRTH,
  LLP_COMPANY_NUMBER,
  PARTNERSHIP_PARTNER_LIST,
  PARTNERSHIP_TRADING_NAME,
  PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH,
  PERMIT_HOLDER_TYPE,
  PUBLIC_BODY_DECLARE_BANKRUPTCY,
  PUBLIC_BODY_DECLARE_OFFENCES,
  PUBLIC_BODY_OFFICER,
  PUBLIC_BODY_NAME
} = require('../../routes')

const blankLine = { blankLine: true }

module.exports = class PermitHolderCheck extends BaseCheck {
  static get ruleSetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-permit-holder`
  }

  async buildLines () {
    const { isIndividual } = await this.getApplication()

    if (isIndividual) {
      return Promise.all([
        this.getTypeLine(),
        this.getIndividualLine(),
        this.getConvictionsLine(),
        this.getBankruptcyLine()
      ])
    }

    const { type } = await this.getPermitHolderType()

    switch (type) {
      case LIMITED_LIABILITY_PARTNERSHIP.type:
        return Promise.all([
          this.getTypeLine(),
          this.getCompanyLine(),
          this.getDesignatedMembersLine(),
          this.getDesignatedMemberEmailLine(),
          this.getConvictionsLine(),
          this.getBankruptcyLine()
        ])
      case PARTNERSHIP.type:
        return Promise.all([
          this.getTypeLine(),
          this.getPartnershipLine(),
          this.getPartnersLine(),
          this.getConvictionsLine(),
          this.getBankruptcyLine()
        ])
      case PUBLIC_BODY.type:
        return Promise.all([
          this.getTypeLine(),
          this.getPublicBodyLine(),
          this.getResponsibleOfficerLine(),
          this.getConvictionsLine(PUBLIC_BODY_DECLARE_OFFENCES),
          this.getBankruptcyLine(PUBLIC_BODY_DECLARE_BANKRUPTCY)
        ])
      default:
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
    const { path } = PERMIT_HOLDER_TYPE
    const { type } = await this.getPermitHolderType()
    return this.buildLine({
      heading: 'Permit holder type',
      prefix: 'type',
      answers: [type],
      links: [{ path, type: 'permit holder' }]
    })
  }

  getAddressLine (address) {
    const {
      buildingNameOrNumber = '',
      addressLine1 = '',
      addressLine2 = '',
      townOrCity = '',
      postcode = ''
    } = address
    let firstLine = buildingNameOrNumber
    if (firstLine && addressLine1) {
      firstLine += ', '
    }
    firstLine += addressLine1
    return [firstLine, addressLine2, townOrCity, postcode]
  }

  async getIndividualLine () {
    const { path } = PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH
    const { firstName = '', lastName = '', email = '' } = await this.getIndividualPermitHolder()
    const { dateOfBirth = 'unknown', telephone = 'unknown' } = await this.getIndividualPermitHolderDetails()
    const address = this.getAddressLine(await this.getIndividualPermitHolderAddress())
    const { tradingName = '' } = await this.getApplication()
    const [year, month, day] = dateOfBirth.split('-')
    const dob = { day, month, year }
    let answers = []
    answers.push(`${firstName} ${lastName}`)
    if (tradingName) {
      answers.push(`Trading as: ${tradingName}`)
    }
    answers.push(email)
    answers.push(`Telephone: ${telephone}`)
    answers.push(`Date of birth: ${Utilities.formatFullDateForDisplay(dob)}`)
    answers.push(blankLine)
    answers = answers.concat(address)
    return this.buildLine({
      heading: 'Permit holder',
      prefix: 'individual',
      answers,
      links: [{ path, type: 'individual details' }]
    })
  }

  async getCompanyLine () {
    const { path } = await this.getPermitHolderType() === LIMITED_LIABILITY_PARTNERSHIP ? LLP_COMPANY_NUMBER : COMPANY_NUMBER
    const { companyNumber = '', accountName = '' } = await this.getCompanyAccount()
    const address = this.getAddressLine(await this.getCompanyRegisteredAddress())
    const { tradingName = '' } = await this.getApplication()
    let answers = []
    answers.push(accountName)
    if (tradingName) {
      answers.push(`Trading as: ${tradingName}`)
    }
    answers = answers.concat(address)
    answers.push(`Company number: ${companyNumber}`)
    return this.buildLine({
      heading: 'Permit holder',
      prefix: 'company',
      answers,
      links: [{ path, type: 'company details' }]
    })
  }

  async getPartnershipLine () {
    const { path } = PARTNERSHIP_TRADING_NAME
    const { tradingName = '' } = await this.getApplication()
    let answers = []
    answers.push(tradingName)
    return this.buildLine({
      heading: `Partnership name`,
      prefix: 'partnership-name',
      answers,
      links: [{ path, type: 'partnership name' }]
    })
  }

  async getPublicBodyLine () {
    const { path } = PUBLIC_BODY_NAME
    const { tradingName = '' } = await this.getApplication()
    const address = this.getAddressLine(await this.getMainAddress())
    let answers = []
    answers.push(tradingName)
    answers = answers.concat(address)
    return this.buildLine({
      heading: `Permit holder`,
      prefix: 'permit-holder',
      answers,
      links: [{ path, type: 'permit holder' }]
    })
  }

  async getDirectorsLine () {
    const { path } = DIRECTOR_DATE_OF_BIRTH
    const { companyNumber = '' } = await this.getCompanyAccount()
    // Only load the directors if the company has been entered
    const directors = companyNumber ? await this.getDirectors() : []
    const answers = directors.map(({ firstName, lastName, dob }) => `${firstName} ${lastName}: ${Utilities.formatFullDateForDisplay(dob)}`)
    return this.buildLine({
      heading: `Directors' dates of birth`,
      prefix: 'director',
      answers: answers,
      links: [{ path, type: `director's date of birth` }]
    })
  }

  async getDesignatedMembersLine () {
    const { path } = LLP_MEMBER_DATE_OF_BIRTH
    const { companyNumber = '' } = await this.getCompanyAccount()
    // Only load the designated members (people and companies) if the company has been entered
    const members = companyNumber ? await this.getMembers() : []
    const companies = companyNumber ? await this.getCompanies() : []
    const answers = members
      .map(({ firstName, lastName, dob }) => `${firstName} ${lastName}: ${Utilities.formatFullDateForDisplay(dob)}`)
      .concat(companies.map(({ accountName }) => accountName))
    return this.buildLine({
      heading: `Designated members' dates of birth`,
      prefix: 'designated-member',
      answers: answers,
      links: [{ path, type: `designated member's date of birth` }]
    })
  }

  async getPartnersLine () {
    const { path } = PARTNERSHIP_PARTNER_LIST
    const partners = await this.getPartners()
    let answers = ['The partners will be the permit holders and each will be responsible for the operation of the permit.']
    partners.forEach(({ name, email, telephone, dob, fullAddress }) => {
      answers.push(blankLine)
      answers.push(name)
      answers.push(fullAddress)
      answers.push(email)
      answers.push(`Telephone: ${telephone}`)
      const [day, month, year] = dob.split('/')
      answers.push(`Date of birth: ${Utilities.formatFullDateForDisplay({ day, month, year })}`)
    })
    return this.buildLine({
      heading: 'Permit holder',
      prefix: 'partner',
      answers: answers,
      links: [{ path, type: `partners` }]
    })
  }

  async getResponsibleOfficerLine () {
    const { path } = PUBLIC_BODY_OFFICER
    const { firstName, lastName, jobTitle, email } = await this.getResponsibleOfficer()
    const name = `${firstName} ${lastName}`
    return this.buildLine({
      heading: 'Responsible officer or executive',
      prefix: 'responsible-officer',
      answers: [name, jobTitle, email],
      links: [{ path, type: `responsible officer` }]
    })
  }

  async getDesignatedMemberEmailLine () {
    const { path } = LLP_COMPANY_DESIGNATED_MEMBER_EMAIL
    const { email = '' } = await this.getDesignatedMemberDetails()
    return this.buildLine({
      heading: 'Designated Member email',
      prefix: 'designated-member-email',
      answers: [email],
      links: [{ path, type: 'designated member email' }]
    })
  }

  async getCompanySecretaryEmailLine () {
    const { path } = COMPANY_DIRECTOR_EMAIL
    const { email = '' } = await this.getCompanySecretaryDetails()
    return this.buildLine({
      heading: 'Company Secretary or director email',
      prefix: 'company-secretary-email',
      answers: [email],
      links: [{ path, type: 'company secretary or director email' }]
    })
  }

  async getConvictionsLine (route) {
    const { path } = route || COMPANY_DECLARE_OFFENCES
    const { relevantOffences = false, relevantOffencesDetails = '' } = await this.getApplication()
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
      links: [{ path, type: 'offences' }]
    })
  }

  async getBankruptcyLine (route) {
    const { path } = route || COMPANY_DECLARE_BANKRUPTCY
    const { bankruptcy = false, bankruptcyDetails = '' } = await this.getApplication()
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
      links: [{ path, type: 'bankruptcy or insolvency' }]
    })
  }
}
