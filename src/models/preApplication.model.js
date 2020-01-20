'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const { ApplicationQuestions } = require('../dynamics')
const { PRE_APPLICATION_ADVICE } = ApplicationQuestions
const { APPLICATION_ADVICE } = PRE_APPLICATION_ADVICE

const answerIds = [
  APPLICATION_ADVICE.questionCode
]

module.exports = class PreApplication {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    const { application } = context

    if (this.receivedPreApplicationAdvice) {
      const { questionCode } = APPLICATION_ADVICE
      const answerText = this.receivedPreApplicationAdvice
      const applicationAnswer = new ApplicationAnswer({ questionCode, answerText })
      await applicationAnswer.save(context)
    }

    if (this.preApplicationReference) {
      application.preApplicationReference = this.preApplicationReference
      await application.save(context)
    }

    return null
  }

  static async get (context) {
    const { application } = context

    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, answerIds)
    const preApplicationAdviceAnswer = applicationAnswers.find(({ questionCode }) => questionCode === APPLICATION_ADVICE.questionCode)

    const preApplication = {
      receivedPreApplicationAdvice: preApplicationAdviceAnswer && preApplicationAdviceAnswer.answerText,
      preApplicationReference: application && application.preApplicationReference
    }

    return new PreApplication(preApplication)
  }
}
