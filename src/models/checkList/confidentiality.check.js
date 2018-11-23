const BaseCheck = require('./base.check')

const { path } = require('../../routes').CONFIDENTIALITY
const { CONFIRM_CONFIDENTIALLY } = require('../../tasks').tasks

module.exports = class ConfidentialityCheck extends BaseCheck {
  static get task () {
    return CONFIRM_CONFIDENTIALLY
  }

  get prefix () {
    return `${super.prefix}-confidentiality`
  }

  async buildLines () {
    return [await this.getConfidentialityLine()]
  }

  async getConfidentialityLine () {
    const { confidentiality = false, confidentialityDetails = '' } = await this.getApplication()
    const answers = []
    if (confidentiality) {
      answers.push('You are claiming confidentiality for these reasons:')
      confidentialityDetails.split('\n').forEach((detail) => answers.push(detail))
    } else {
      answers.push('You are not claiming confidentiality')
    }
    return this.buildLine({
      heading: 'Commercial confidentiality',
      answers,
      links: [{ path, type: 'commercial confidentiality' }]
    })
  }
}
