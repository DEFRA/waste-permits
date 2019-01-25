const BaseCheck = require('./base.check')

const { MCP_BUSINESS_ACTIVITY } = require('../../tasks').tasks
const { MCP_BUSINESS_ACTIVITY: { path } } = require('../../routes')

module.exports = class McpBusinessActivityCheck extends BaseCheck {
  static get task () {
    return MCP_BUSINESS_ACTIVITY
  }

  get prefix () {
    return `${super.prefix}-mcp-business-activity`
  }

  async buildLines () {
    return Promise.all([this.getMcpBusinessActivityLines()])
  }

  async getMcpBusinessActivityLines () {
    const answers = []

    const mcpBusinessType = await this.getMcpBusinessType()
    if (mcpBusinessType && mcpBusinessType.code) {
      answers.push(mcpBusinessType.code)
    }

    return this.buildLine({
      heading: 'Business or activity type',
      answers,
      links: [
        { path, type: 'business or activity type' }
      ]
    })
  }
}
