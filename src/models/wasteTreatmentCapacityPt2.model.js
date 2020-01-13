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

async function getRelevantApplicationLine (context, activityIndex) {
  // fetch all application lines, including discounts
  const allWasteTreatmentCapacityApplicationLines =
    await ApplicationLine.listForWasteActivities(context)
  // filter out the discounts, prevents them being included in task list
  const wasteTreatmentCapacityApplicationLines =
    allWasteTreatmentCapacityApplicationLines.filter(({ value }) => value > -1)
  return {
    applicationLine: wasteTreatmentCapacityApplicationLines[activityIndex],
    hasNext: wasteTreatmentCapacityApplicationLines
      .slice(activityIndex + 1)
      .length > 0
  }
}

async function saveAnswer (answer, context) {
  const saver = new ApplicationAnswer(answer)
  return saver.save(context)
}

module.exports = {
  treatmentAnswers,
  getForActivity: async function (context, activityIndex) {
    const { applicationLine, hasNext } =
      await getRelevantApplicationLine(context, activityIndex)

    const activityDisplayName =
      (applicationLine.lineName || '').trim()

    const wasteTreatmentCapacityAnswers = await ApplicationAnswer
      .listForApplicationLine(
        context,
        applicationLine.id,
        treatmentAnswers.map(answer => answer.questionCode)
      )
    return {
      wasteTreatmentCapacityAnswers,
      activityDisplayName,
      hasNext
    }
  },
  saveAnswers: async function (context, activityIndex, answers) {
    const positiveAnswers = Object.keys(answers)
    const { applicationLine, hasNext } =
      await getRelevantApplicationLine(context, activityIndex)

    const toSave = treatmentAnswers.map(ta => ({
      applicationLineId: applicationLine.id,
      questionCode: ta.questionCode,
      answerCode: positiveAnswers.indexOf(ta.questionCode) >= 0 ? 'yes' : 'no'
    }))

    const savePromises = toSave.map(answer => saveAnswer(answer, context))
    await Promise.all(savePromises)

    return {
      hasNext,
      forActivityIndex: activityIndex
    }
  }
}
