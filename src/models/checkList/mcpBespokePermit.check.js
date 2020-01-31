const BaseCheck = require('./base.check')

const { path } = require('../../routes').BESPOKE_OR_STANDARD_RULES

module.exports = class McpBespokePermitCheck extends BaseCheck {
  get prefix () {
    return `${super.prefix}-permit`
  }

  async buildLines () {
    return [await this.getMcpBespokePermitLine()]
  }

  async getMcpBespokePermitLine () {
    const mcpType = await this.getMcpType()

    return this.buildLine({
      heading: 'Permit',
      answers: [`${mcpType.text}`],
      links: [{ path, type: 'contact details' }]
    })
  }
}
