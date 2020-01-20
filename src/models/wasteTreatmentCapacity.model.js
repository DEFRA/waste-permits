'use strict'

const ApplicationLine =
  require('../persistence/entities/applicationLine.entity')
const ApplicationAnswer =
  require('../persistence/entities/applicationAnswer.entity')

const treatmentAnswers = [
  {
    questionCode: 'treatment-hazardous',
    questionText: 'Treatment of hazardous waste',
    answerCode: 'no',
    weightCode: 'treatment-hazardous-daily',
    weight: 0
  },
  {
    questionCode: 'treatment-biological',
    questionText: 'Biological treatment (eg composting or anaerobic digestion)',
    answerCode: 'no',
    weightCode: 'treatment-biological-daily',
    weight: 0

  },
  {
    questionCode: 'treatment-chemical',
    questionText: 'Physico-chemical treatment for disposal',
    answerCode: 'no',
    weightCode: 'treatment-chemical-daily',
    weight: 0

  },
  {
    questionCode: 'treatment-incineration',
    questionText: 'Pre-treatment of waste for incineration or co-incineration',
    answerCode: 'no',
    weightCode: 'treatment-incineration-daily',
    weight: 0
  },
  {
    questionCode: 'treatment-slags',
    questionText: 'Treatment of slags and ashes',
    answerCode: 'no',
    weightCode: 'treatment-slags-daily',
    weight: 0
  },
  {
    questionCode: 'treatment-metal',
    questionText: `Treatment in shredders of metal waste, including
      waste electrical and electronic equipment and end-of-life
      vehicles and their components`,
    answerCode: 'no',
    weightCode: 'treatment-metal-daily',
    weight: 0

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
          .concat(treatmentAnswers.map(answer => answer.weightCode))
      )
    return {
      wasteTreatmentCapacityAnswers,
      activityDisplayName,
      hasNext
    }
  },
  saveWeights: async function (context, activityIndex, weights) {
    const { applicationLine, hasNext } =
      await getRelevantApplicationLine(context, activityIndex)
    const toSave = Object.keys(weights).map(weightId => {
      return {
        applicationLineId: applicationLine.id,
        questionCode: weightId,
        answerText: String(weights[weightId])
      }
    })
    console.log(toSave)
    const savePromises = toSave.map(answer => saveAnswer(answer, context))
    await Promise.all(savePromises)
    return {
      hasNext,
      forActivityIndex: activityIndex
    }
  },
  saveAnswers: async function (context, activityIndex, answers) {
    const positiveAnswers = Object.keys(answers)
    const { applicationLine, hasNext } =
      await getRelevantApplicationLine(context, activityIndex)
    let noTreatment = false
    const toSave = treatmentAnswers.map(ta => {
      const rtn = []
      const answerCode = positiveAnswers.indexOf(ta.questionCode) >= 0 ? 'yes' : 'no'
      if (answerCode === 'no' && ta.questionCode !== 'treatment-none') {
        // make sure corresponding weight is set to empty
        rtn.push({
          applicationLineId: applicationLine.id,
          questionCode: ta.weightCode,
          answerText: undefined
        })
      }
      if (ta.questionCode === 'treatment-none' && answerCode === 'yes') {
        noTreatment = true
      }
      rtn.push({
        applicationLineId: applicationLine.id,
        questionCode: ta.questionCode,
        answerCode
      })
      return rtn
    })
    const savePromises = [].concat(...toSave).map(answer => saveAnswer(answer, context))
    await Promise.all(savePromises)

    return {
      noTreatment,
      hasNext,
      forActivityIndex: activityIndex
    }
  },
  getAllWeightsHaveBeenEnteredForApplication: async function (context) {
    return true
  }
}
