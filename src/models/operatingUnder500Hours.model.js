'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const OPERATING_UNDER_500_HOURS = 'operating-under-500-hours'
const YES = 'yes'
const NO = 'no'

module.exports = class OperatingUnder500Hours {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    let answer

    answer = {
      questionCode: OPERATING_UNDER_500_HOURS,
      answerText: this.operatingUnder500Hours ? YES : NO
    }

    const applicationAnswer = new ApplicationAnswer(answer)
    await applicationAnswer.save(context)

    return null
  }

  static async get (context) {
    const answer = await ApplicationAnswer.getByQuestionCode(context, OPERATING_UNDER_500_HOURS)

    const operatingUnder500Hours = {
      operatingUnder500Hours: answer && answer.answerText === YES
    }

    return new OperatingUnder500Hours(operatingUnder500Hours)
  }
}
