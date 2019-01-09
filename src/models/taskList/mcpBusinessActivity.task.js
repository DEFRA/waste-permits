'use strict'

const BaseTask = require('./base.task')
const McpBusinessType = require('../mcpBusinessType.model')

module.exports = class McpBusinessActivity extends BaseTask {
  static async checkComplete (context) {
    const mcpBusinessType = await McpBusinessType.get(context)

    return Boolean(mcpBusinessType.code)
  }
}
