const BaseCheck = require('./base.check')

const { MCP_DETAILS } = require('../../tasks').tasks
const { MCP_DETAILS: { path } } = require('../../routes')

module.exports = class McpDetailsCheck extends BaseCheck {
  static get task () {
    return MCP_DETAILS
  }

  get prefix () {
    return `${super.prefix}-mcp-details`
  }

  async buildLines () {
    return Promise.all([this.getMcpDetailsLine()])
  }

  async getMcpDetailsLine () {
    const evidence = await this.getMcpDetails()
    return this.buildLine({
      heading: 'Medium combustion plants details',
      answers: evidence.map((file) => file.filename),
      links: [
        { path, type: 'medium combustion plants details' }
      ]
    })
  }
}
