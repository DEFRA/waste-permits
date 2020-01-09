'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const { ApplicationQuestions } = require('../dynamics')
const { PRE_APPLICATION_ADVICE } = ApplicationQuestions
const { DISCUSSED_APPLICATION } = PRE_APPLICATION_ADVICE

const answerIds = [
  DISCUSSED_APPLICATION.questionCode
]

module.exports = class PreApplicationAdvice {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    let applicationAnswers = []

    if (this.discussedApplication) { applicationAnswers.push({ questionCode: DISCUSSED_APPLICATION.questionCode, answerText: this.discussedApplication }) }

    applicationAnswers.forEach(async (item) => {
      const applicationAnswer = new ApplicationAnswer(item)
      await applicationAnswer.save(context)
    })

    return null
  }

  static async get (context) {
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, answerIds)
    const discussedApplicationAnswer = applicationAnswers.find(({ questionCode }) => questionCode === DISCUSSED_APPLICATION.questionCode)

    const preApplication = {
      discussedApplication: discussedApplicationAnswer && discussedApplicationAnswer.answerText
    }

    return new PreApplicationAdvice(preApplication)
  }
}
