'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const { CLINICAL_WASTE_DOCUMENTS } = require('../dynamics').ApplicationQuestions
const { STORE_TREAT } = CLINICAL_WASTE_DOCUMENTS

const YES = 'yes'
const NO = 'no'

module.exports = class StoreTreat {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    const answer = {
      questionCode: STORE_TREAT.questionCode,
      answerText: this.storeTreat ? YES : NO
    }

    const applicationAnswer = new ApplicationAnswer(answer)
    await applicationAnswer.save(context)

    return null
  }

  static async get (context) {
    const answer = await ApplicationAnswer.getByQuestionCode(context, STORE_TREAT.questionCode)

    const storeTreat = {
      storeTreat: answer && answer.answerText === YES
    }

    return new StoreTreat(storeTreat)
  }
}
