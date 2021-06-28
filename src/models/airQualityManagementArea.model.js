'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const { ApplicationQuestions } = require('../dynamics')
const { AQMA } = ApplicationQuestions
const { IS_IN_AQMA, AQMA_NAME, NO2_LEVEL, AUTH_NAME } = AQMA
const answerIds = [
  IS_IN_AQMA.questionCode,
  AQMA_NAME.questionCode,
  NO2_LEVEL.questionCode,
  AUTH_NAME.questionCode
]
const YES = 'yes'
const NO = 'no'

module.exports = class AirQualityManagementArea {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    const applicationAnswers = [{
      questionCode: IS_IN_AQMA.questionCode,
      answerText: this.isInAqma ? YES : NO
    }, {
      questionCode: AQMA_NAME.questionCode,
      answerText: this.name
    }, {
      questionCode: NO2_LEVEL.questionCode,
      answerText: this.nitrogenDioxideLevel
    }, {
      questionCode: AUTH_NAME.questionCode,
      answerText: this.localAuthorityName
    }]

    applicationAnswers.forEach(async (item) => {
      const applicationAnswer = new ApplicationAnswer(item)
      await applicationAnswer.save(context)
    })

    return null
  }

  static async get (context) {
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, answerIds)
    const isInAqmaAnswer = applicationAnswers.find(({ questionCode }) => questionCode === IS_IN_AQMA.questionCode)
    const nameAnswer = applicationAnswers.find(({ questionCode }) => questionCode === AQMA_NAME.questionCode)
    const nitrogenDioxideLevelAnswer = applicationAnswers.find(({ questionCode }) => questionCode === NO2_LEVEL.questionCode)
    const localAuthorityNameAnswer = applicationAnswers.find(({ questionCode }) => questionCode === AUTH_NAME.questionCode)

    const aqma = {
      isInAqma: isInAqmaAnswer && isInAqmaAnswer.answerText === YES,
      name: nameAnswer && nameAnswer.answerText,
      nitrogenDioxideLevel: nitrogenDioxideLevelAnswer && nitrogenDioxideLevelAnswer.answerText,
      localAuthorityName: localAuthorityNameAnswer && localAuthorityNameAnswer.answerText
    }

    return new AirQualityManagementArea(aqma)
  }
}
