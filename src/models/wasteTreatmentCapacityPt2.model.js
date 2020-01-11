'use strict'

const DataStore =
  require('../models/dataStore.model')
const ApplicationLine =
  require('../persistence/entities/applicationLine.entity')
const ApplicationAnswer =
  require('../persistence/entities/applicationAnswer.entity')

async function listForWasteActivitiesMinusDiscountLines (context) {
  // fetch all application lines, including discounts
  const allWasteTreatmentCapacityApplicationLines =
    await ApplicationLine.listForWasteActivities(context)
  // filter out the discounts, prevents them being included in task list
  const wasteTreatmentCapacityApplicationLines =
    allWasteTreatmentCapacityApplicationLines.filter(({ value }) => value > -1)
  return wasteTreatmentCapacityApplicationLines
}

module.exports = {
  getForActivity: async function (context, activityIndex) {
    const wasteTreatmentCapacityApplicationLines =
      await listForWasteActivitiesMinusDiscountLines(context)

    const wasteTreatmentCapacityApplicationLine =
      wasteTreatmentCapacityApplicationLines[activityIndex]

    const wasteTreatmentCapacityAnswers = await ApplicationAnswer
      .listForApplicationLine(
        context,
        wasteTreatmentCapacityApplicationLine.id,
        [
          'treatment-hazardous',
          'treatment-biological',
          'treatment-chemical',
          'treatment-incineration',
          'treatment-slags',
          'treatment-metal',
          'treatment-none'
        ]
      )

    const anAnswer = await ApplicationAnswer.getByQuestionCode(context, 'treatment-hazardous')

    console.log('!!!', anAnswer)

    return {
      wasteTreatmentCapacityAnswers,
      hasNext: wasteTreatmentCapacityApplicationLines
        .slice(activityIndex + 1)
        .length > 0
    }
  }
}
