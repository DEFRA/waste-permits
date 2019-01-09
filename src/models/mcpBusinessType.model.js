'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const ApplicationQuestionOption = require('../persistence/entities/applicationQuestionOption.entity')

const { MCP_BUSINESS_TYPE: { questionCode, mainOptionIds } } = require('../dynamics').ApplicationQuestions

module.exports = class McpBusinessType {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  static async getMcpBusinessTypesLists (context) {
    const allOptions = await ApplicationQuestionOption.listOptionsForQuestion(context, questionCode)

    return {
      mainTypes: mainOptionIds.map((id) => {
        const { optionName } = allOptions.find(({ shortName }) => shortName === id)
        return { code: id, description: optionName }
      }),
      otherTypes: allOptions
        .filter(({ shortName }) => !mainOptionIds.find((id) => id === shortName))
        .map(({ shortName, optionName }) => ({ code: shortName, description: optionName }))
        .sort((a, b) => a.description < b.description ? -1 : a.description > b.description ? 1 : 0)
    }
  }

  static async get (context) {
    const applicationAnswer = await ApplicationAnswer.getByQuestionCode(context, questionCode)
    if (applicationAnswer) {
      return new McpBusinessType({ code: applicationAnswer.answerCode, description: applicationAnswer.answerDescription })
    } else {
      return new McpBusinessType()
    }
  }

  static async save (context, code) {
    const applicationAnswer = new ApplicationAnswer({ questionCode, answerCode: code })
    await applicationAnswer.save(context)
  }
}
