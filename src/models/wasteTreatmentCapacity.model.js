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
    weightTreatmentCode: 'treatment-hazardous-daily',
    weightTreatment: 0
  },
  {
    questionCode: 'treatment-biological',
    questionText: 'Biological treatment (eg composting or anaerobic digestion)',
    answerCode: 'no',
    weightTreatmentCode: 'treatment-biological-daily',
    weightTreatment: 0

  },
  {
    questionCode: 'treatment-chemical',
    questionText: 'Physico-chemical treatment for disposal',
    answerCode: 'no',
    weightTreatmentCode: 'treatment-chemical-daily',
    weightTreatment: 0

  },
  {
    questionCode: 'treatment-incineration',
    questionText: 'Pre-treatment of waste for incineration or co-incineration',
    answerCode: 'no',
    weightTreatmentCode: 'treatment-incineration-daily',
    weightTreatment: 0
  },
  {
    questionCode: 'treatment-slags',
    questionText: 'Treatment of slags and ashes',
    answerCode: 'no',
    weightTreatmentCode: 'treatment-slags-daily',
    weightTreatment: 0
  },
  {
    questionCode: 'treatment-metal',
    questionText: `Treatment in shredders of metal waste, including
      waste electrical and electronic equipment and end-of-life
      vehicles and their components`,
    answerCode: 'no',
    weightTreatmentCode: 'treatment-metal-daily',
    weightTreatment: 0

  },
  {
    questionCode: 'treatment-none',
    questionText: 'None of the above',
    answerCode: 'no'
  }
]

function getTreatmentAnswerForQuestionCode (questionCode) {
  return treatmentAnswers.find(ta => ta.questionCode === questionCode)
}

function getAnswerFromArrayByQuestionCode (questionCode, answerArr) {
  return answerArr.find(a => a.questionCode === questionCode)
}

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
          .concat(treatmentAnswers.map(answer => answer.weightTreatmentCode))
      )
    return {
      wasteTreatmentCapacityAnswers,
      activityDisplayName,
      hasNext
    }
  },
  saveWeights: async function (context, activityIndex, weightTreatments) {
    const { applicationLine, hasNext } =
      await getRelevantApplicationLine(context, activityIndex)
    console.log(weightTreatments)
    const toSave = Object.keys(weightTreatments).map(weightTreatmentId => {
      return {
        applicationLineId: applicationLine.id,
        questionCode: weightTreatmentId,
        answerText: String(weightTreatments[weightTreatmentId])
      }
    })
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
        // make sure corresponding weightTreatment is set to empty
        rtn.push({
          applicationLineId: applicationLine.id,
          questionCode: ta.weightTreatmentCode,
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
    const submittedPerActivity = {}
    console.log('111 LETS CHECK ALL THE WEIGHTS ARE PRESENT')
    const allWasteTreatmentCapacityApplicationLines =
      await ApplicationLine.listForWasteActivities(context)
    const applicationLinesMinusDiscounts = allWasteTreatmentCapacityApplicationLines.filter(al => al.value >= 0)
    // console.log('222 ALL APPLICATION LINES', applicationLinesMinusDiscounts)
    applicationLinesMinusDiscounts.forEach(al => {
      submittedPerActivity[al.id] = {
        lineName: al.lineName,
        answers: []
      }
    })
    const weightTreatmentArrays = await Promise
      .all(applicationLinesMinusDiscounts.map(async al => {
        const wasteTreatmentCapacityAnswers = await ApplicationAnswer
          .listForApplicationLine(
            context,
            al.id,
            treatmentAnswers.map(answer => answer.questionCode)
              .concat(treatmentAnswers.map(answer => answer.weightTreatmentCode))
          )
        return wasteTreatmentCapacityAnswers
      }))
    const weightTreatments = [].concat.apply([], weightTreatmentArrays)
    // console.log('333 WEIGHTS?', weightTreatments)
    const weightTreatmentsByActivity = weightTreatments
      .reduce((accumulator, weightTreatmentAnswer) => {
        const arr =
          accumulator[weightTreatmentAnswer.applicationLineId].answers
        accumulator[weightTreatmentAnswer.applicationLineId].answers =
          arr.concat(weightTreatmentAnswer)
        return accumulator
      }, submittedPerActivity)
    // console.log('444', weightTreatmentsByActivity)
    Object.keys(weightTreatmentsByActivity).forEach(activityId => {
      // console.log(`555 ${activityId}`)
      const submittedArr = weightTreatmentsByActivity[activityId].answers
        .filter(answer => {
          // console.log('^^^', answer)
          return answer.answerCode === 'yes' || answer.answerText
        })
      submittedPerActivity[activityId].answers = submittedArr
    })
    // console.log('666', submittedPerActivity)
    let allValid = true
    Object.keys(submittedPerActivity).forEach(activityId => {
      const answers = submittedPerActivity[activityId].answers
      // console.log(answers)
      let valid = false
      if (answers.length === 1 && answers[0].questionCode === 'treatment-none') {
        // need to check that every answer questionCode
        // has an answer with a corresponding weightTreatmentCode
        valid = true
      }
      if (answers.length > 1 && answers.length % 2 === 0) {
        answers.forEach(a => {
          const res = getTreatmentAnswerForQuestionCode(a.questionCode)
          const weightTreatmentCode = res ? res.weightTreatmentCode : false
          if (res && weightTreatmentCode) {
            /*
            console.log(
              '###',
              activityId,
              a.questionCode,
              weightTreatmentCode,
              getAnswerFromArrayByQuestionCode(weightTreatmentCode, answers)
            )
            */
            valid = true
          }
        })
      }
      submittedPerActivity[activityId].valid = valid
      if (valid === false) {
        allValid = false
      }
    })
    console.log('777', submittedPerActivity)
    console.log('888', allValid)

    return allValid
  }
}
