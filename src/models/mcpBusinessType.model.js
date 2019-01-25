'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const { MCP_BUSINESS_TYPE: { questionCode, mainAnswers } } = require('../dynamics').ApplicationQuestions

module.exports = class McpBusinessType {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  static getMcpMainBusinessTypesList () {
    return mainAnswers.map((item) => Object.assign({}, item))
  }

  static async get (context) {
    const applicationAnswer = await ApplicationAnswer.getByQuestionCode(context, questionCode)
    if (applicationAnswer) {
      return new McpBusinessType({ code: applicationAnswer.answerText })
    } else {
      return new McpBusinessType()
    }
  }

  static async save (context, code) {
    const applicationAnswer = new ApplicationAnswer({ questionCode, answerText: code })
    await applicationAnswer.save(context)
  }
}
