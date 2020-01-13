'use strict'

const DataStore =
  require('../models/dataStore.model')
const ApplicationLine =
  require('../persistence/entities/applicationLine.entity')
const ApplicationAnswer =
  require('../persistence/entities/applicationAnswer.entity')

const treatmentAnswers = [
  {
    questionCode: 'treatment-hazardous',
    questionText: 'Treatment of hazardous waste',
    answerCode: 'no'

  },
  {
    questionCode: 'treatment-biological',
    questionText: 'Biological treatment (eg composting or anaerobic digestion)',
    answerCode: 'no'

  },
  {
    questionCode: 'treatment-chemical',
    questionText: 'Physico-chemical treatment for disposal',
    answerCode: 'no'

  },
  {
    questionCode: 'treatment-incineration',
    questionText: 'Pre-treatment of waste for incineration or co-incineration',
    answerCode: 'no'

  },
  {
    questionCode: 'treatment-slags',
    questionText: 'Treatment of slags and ashes',
    answerCode: 'no'

  },
  {
    questionCode: 'treatment-metal',
    questionText: `Treatment in shredders of metal waste, including
      waste electrical and electronic equipment and end-of-life
      vehicles and their components`,
    answerCode: 'no'

  },
  {
    questionCode: 'treatment-none',
    questionText: 'None of the above',
    answerCode: 'no'
  }
]

async function listForWasteActivitiesMinusDiscountLines (context) {
  // fetch all application lines, including discounts
  const allWasteTreatmentCapacityApplicationLines =
    await ApplicationLine.listForWasteActivities(context)
  // filter out the discounts, prevents them being included in task list
  const wasteTreatmentCapacityApplicationLines =
    allWasteTreatmentCapacityApplicationLines.filter(({ value }) => value > -1)
  return wasteTreatmentCapacityApplicationLines
}

async function saveAnswer (answer, context) {
  const saver = new ApplicationAnswer(answer)
  return saver.save(context)
}

module.exports = {
  treatmentAnswers,
  getForActivity: async function (context, activityIndex) {
    const wasteTreatmentCapacityApplicationLines =
      await listForWasteActivitiesMinusDiscountLines(context)

    const wasteTreatmentCapacityApplicationLine =
      wasteTreatmentCapacityApplicationLines[activityIndex]

    const activityDisplayName =
      (wasteTreatmentCapacityApplicationLine.lineName || '').trim()

    const wasteTreatmentCapacityAnswers = await ApplicationAnswer
      .listForApplicationLine(
        context,
        wasteTreatmentCapacityApplicationLine.id,
        treatmentAnswers.map(answer => answer.questionCode)
      )
    return {
      wasteTreatmentCapacityAnswers,
      activityDisplayName,
      hasNext: wasteTreatmentCapacityApplicationLines
        .slice(activityIndex + 1)
        .length > 0
    }
  },
  saveAnswers: async function (answers) {
    console.log('ANSWERS TO SAVE:', answers)
    /*
    await saveAnswer({
      applicationLineId: wasteTreatmentCapacityApplicationLine.id,
      questionCode: 'treatment-biological',
      answerCode: 'yes'
      // answerText: undefined
    }, context)
      .then(() => { console.log('SUCCESS:') })
      .catch(err => { console.log('FAIL', err) })
    */
  }
}
