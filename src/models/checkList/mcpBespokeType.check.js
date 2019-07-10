const BaseCheck = require('./base.check')

const { path } = require('../../routes').MCP_TYPE

module.exports = class McpBespokeTypeCheck extends BaseCheck {
  get prefix () {
    return `${super.prefix}-mcp-bespoke-type`
  }

  async buildLines () {
    return [await this.getMcpBespokeTypeLine()]
  }

  async getMcpBespokeTypeLine () {
    const mcpType = await this.getMcpType()

    return this.buildLine({
      heading: 'Permit',
      answers: [`${mcpType.text}`],
      links: [{ path, type: 'contact details' }]
    })
  }
}
