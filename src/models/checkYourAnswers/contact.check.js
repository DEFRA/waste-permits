const Constants = require('../../constants')
const BaseCheck = require('./base.check')

const {path} = Constants.Routes.CONTACT_DETAILS
const {CONTACT_DETAILS: ruleSetId} = Constants.Dynamics.RulesetIds

module.exports = class ContactCheck extends BaseCheck {
  static get rulesetId () {
    return ruleSetId
  }

  get prefix () {
    return `${super.prefix}-contact`
  }

  async buildLines () {
    return Promise.all([
      this.getContactLine(),
      this.getAgentLine(),
      this.getTelephoneLine(),
      this.getEmailLine(),
      this.getCompanySecretaryEmailLine()
    ])
  }

  async getContactLine () {
    const {firstName = '', lastName = ''} = await this.getContact()
    return this.buildLine({
      heading: 'Contact for this application',
      prefix: 'name',
      answers: [`${firstName} ${lastName}`],
      links: [{path, type: 'contact details'}]
    })
  }

  async getAgentLine () {
    const {name = ''} = await this.getAgentAccount()
    const description = name ? 'This person is an agent or consultant' : 'This person is not an agent or consultant'
    return this.buildLine({
      heading: 'Agent or consultant',
      prefix: 'agent',
      answers: [description, name],
      links: [{path, type: 'agent details'}]
    })
  }

  async getTelephoneLine () {
    const {telephone = ''} = await this.getPrimaryContactDetails()
    return this.buildLine({
      heading: 'Contact telephone number',
      prefix: 'telephone',
      answers: [telephone],
      links: [{path, type: 'contact telephone number'}]
    })
  }

  async getEmailLine () {
    const {email = ''} = await this.getContact()
    return this.buildLine({
      heading: 'Main contact email',
      prefix: 'email',
      answers: [email],
      links: [{path, type: 'main contact email'}]
    })
  }

  async getCompanySecretaryEmailLine () {
    const {email = ''} = await this.getCompanySecretaryDetails()
    return this.buildLine({
      heading: 'Company Secretary or director email',
      prefix: 'company-secretary-email',
      answers: [email],
      links: [{path, type: 'company secretary or director email'}]
    })
  }
}
