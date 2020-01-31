const BaseCheck = require('./base.check')

const { path } = require('../../routes').BESPOKE_OR_STANDARD_RULES

module.exports = class WasteBespokePermitCheck extends BaseCheck {
  get prefix () {
    return `${super.prefix}-permit`
  }

  async buildLines () {
    return [await this.getBespokeTypeLine()]
  }

  async getBespokeTypeLine () {
    return this.buildLine({
      heading: 'Permit',
      answers: ['Bespoke environmental permit'],
      links: [{ path, type: 'bespoke environmental permit' }]
    })
  }
}
