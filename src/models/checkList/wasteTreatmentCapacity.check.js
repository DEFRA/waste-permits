const BaseCheck = require('./base.check')

const { WASTE_TREATMENT_CAPACITY } = require('../../tasks').tasks
const { WASTE_TREATMENT_CAPACITIES: { path } } = require('../../routes')

const WasteTreatmentCapacity = require('../wasteTreatmentCapacity.model')

module.exports = class WasteWeightsCheck extends BaseCheck {
  static get task () {
    return WASTE_TREATMENT_CAPACITY
  }

  get prefix () {
    return `${super.prefix}-waste-treatment-capacity`
  }

  async buildLines () {
    const wasteTreatmentCapacity = await this.getWasteTreatmentCapacity()
    const lines = []

    // iterate over each object in wasteTreatmentCapacity
    const keys = Object.keys(wasteTreatmentCapacity)
    keys.forEach(entry => {
      const object = wasteTreatmentCapacity[entry]
      // only interested in objects with a lineName property
      if (object.hasOwnProperty('lineName')) {
        const { answers } = object
        answers.forEach(answer => {
          const { answerText, questionCode } = answer
          // if this answer has a value for answerText (ie. a capacity value) then add a line for it
          if (answerText) {
            const treatmentAnswer = WasteTreatmentCapacity.getTreatmentAnswerForWeightTreatmentCode(questionCode)
            const questionText = WasteTreatmentCapacity.getCleanQuestionText(treatmentAnswer.questionCode)
            const heading = `Daily capacity for ${questionText} (tonnes)`
            const capacity = answerText
            lines.push(this.buildWasteTreatmentLine(capacity, heading, questionCode))
          }
        })
      }
    })

    if (!lines.length) {
      lines.push(this.buildWasteTreatmentLine('none', 'Waste treatment capacity', 'waste-treatment-capacity'))
    }

    return lines
  }

  buildWasteTreatmentLine (capacity, heading, prefix) {
    return this.buildLine({
      heading,
      prefix,
      answers: [capacity],
      links: [
        { path, type: 'waste treatment capacity' }
      ]
    })
  }
}
