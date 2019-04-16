'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const { MCP_TYPES, ApplicationQuestions } = require('../dynamics')
const { questionCode } = ApplicationQuestions.MCP_PERMIT_TYPES

const mcpTypes = Object.keys(MCP_TYPES).map((mcpType) => MCP_TYPES[mcpType])

module.exports = class McpType {
  constructor (data) {
    Object.assign(this, data)
  }

  async save (context) {
    const applicationAnswer = new ApplicationAnswer({ questionCode })
    applicationAnswer.answerCode = this.id
    await applicationAnswer.save(context)
  }

  static async get (context) {
    const { answerCode } = await ApplicationAnswer.getByQuestionCode(context, questionCode) || {}
    const mcpType = mcpTypes.find(({ id }) => id === answerCode) || {}
    return new McpType(mcpType)
  }
}
