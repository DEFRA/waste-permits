const BaseCheck = require('./base.check')

const { path } = require('../../routes').CONTACT_DETAILS
const { CONTACT_DETAILS } = require('../../tasks').tasks
const { PRIMARY_CONTACT_DETAILS } = require('../../dynamics').AddressTypes

module.exports = class ContactCheck extends BaseCheck {
  static get task () {
    return CONTACT_DETAILS
  }

  get prefix () {
    return `${super.prefix}-contact`
  }

  async buildLines () {
    return Promise.all([
      this.getContactLine(),
      this.getAgentLine(),
      this.getTelephoneLine(),
      this.getEmailLine()
    ])
  }

  async getContactLine () {
    const { firstName = '', lastName = '' } = await this.getContactDetails(PRIMARY_CONTACT_DETAILS)
    return this.buildLine({
      heading: 'Contact for this application',
      prefix: 'name',
      answers: [`${firstName} ${lastName}`],
      links: [{ path, type: 'contact details' }]
    })
  }

  async getAgentLine () {
    const { accountName = '' } = await this.getAgentAccount()
    const description = accountName ? 'This person is an agent or consultant' : 'This person is not an agent or consultant'
    return this.buildLine({
      heading: 'Agent or consultant',
      prefix: 'agent',
      answers: [description, accountName],
      links: [{ path, type: 'agent details' }]
    })
  }

  async getTelephoneLine () {
    const { telephone = '' } = await this.getContactDetails(PRIMARY_CONTACT_DETAILS)
    return this.buildLine({
      heading: 'Contact telephone number',
      prefix: 'telephone',
      answers: [telephone],
      links: [{ path, type: 'contact telephone number' }]
    })
  }

  async getEmailLine () {
    const { email = '' } = await this.getContactDetails(PRIMARY_CONTACT_DETAILS)
    return this.buildLine({
      heading: 'Main contact email',
      prefix: 'email',
      answers: [email],
      links: [{ path, type: 'main contact email' }]
    })
  }
}
