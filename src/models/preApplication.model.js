'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const { ApplicationQuestions } = require('../dynamics')
const { PRE_APPLICATION_ADVICE } = ApplicationQuestions
const { APPLICATION_ADVICE } = PRE_APPLICATION_ADVICE

const answerIds = [
  APPLICATION_ADVICE.questionCode
]

module.exports = class PreApplicationAdvice {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    let applicationAnswers = []

    if (this.applicationAdvice) { applicationAnswers.push({ questionCode: APPLICATION_ADVICE.questionCode, answerText: this.applicationAdvice }) }

    applicationAnswers.forEach(async (item) => {
      const applicationAnswer = new ApplicationAnswer(item)
      await applicationAnswer.save(context)
    })

    return null
  }

  static async get (context) {
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, answerIds)
    const applicationAdviceAnswer = applicationAnswers.find(({ questionCode }) => questionCode === APPLICATION_ADVICE.questionCode)

    const preApplication = {
      applicationAdvice: applicationAdviceAnswer && applicationAdviceAnswer.answerText
    }

    return new PreApplicationAdvice(preApplication)
  }
}
