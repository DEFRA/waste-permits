const BaseCheck = require('./base.check')

const { PRE_APPLICATION_REFERENCE } = require('../../tasks').tasks
const { path } = require('../../routes').PRE_APPLICATION_REFERENCE

module.exports = class PreApplicationCheck extends BaseCheck {
  static get task () {
    return PRE_APPLICATION_REFERENCE
  }

  get prefix () {
    return `${super.prefix}-preapp`
  }

  async buildLines () {
    return [await this.getPreApplicationLine()]
  }

  async getPreApplicationLine () {
    const { preApplicationReference } = await this.getPreApplication()
    return this.buildLine({
      heading: 'Pre-application reference',
      answers: [`${preApplicationReference}`],
      links: [{ path, type: 'pre-application reference' }]
    })
  }
}
