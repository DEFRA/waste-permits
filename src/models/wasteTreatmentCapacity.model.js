'use strict'

const ApplicationLine =
  require('../persistence/entities/applicationLine.entity')
const ApplicationAnswer =
  require('../persistence/entities/applicationAnswer.entity')

// an array that contains waste treatment answers as if each pair
// (check-box and weight input) were a single object
// questionCode is for the check-box questions and is always present
// weightTreatmentCode is for the text/entry questions
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
  // pick out a treatment answer (from our list) based on its questionCode/check-box id
  return treatmentAnswers.find(ta => ta.questionCode === questionCode)
}

function getTreatmentAnswerForWeightTreatmentCode (weightTreatmentCode) {
  // pick out a treatment answer (from our list) based on its weightTreatmentCode
  return treatmentAnswers.find(ta => ta.weightTreatmentCode === weightTreatmentCode)
}

function getCleanQuestionText (questionCode) {
  const { questionText } = getTreatmentAnswerForQuestionCode(questionCode)

  // if text contains a bracket, return the portion before it
  const bracketIndex = questionText.indexOf('(')
  if (bracketIndex !== -1) { return questionText.substring(0, bracketIndex).trim() }

  // if text contains a comma, return the portion before it
  const commaIndex = questionText.indexOf(',')
  if (commaIndex !== -1) { return questionText.substring(0, commaIndex).trim() }

  return questionText
}

/*
function getAnswerFromArrayByQuestionCode (questionCode, answerArr) {
  // pick out a treatment answer (coming back from dynamics) based
  // on its questionCode/check-box id
  return answerArr.find(a => a.questionCode === questionCode)
}
*/

async function getRelevantApplicationLine (context, activityIndex) {
  // fetch all application lines, including discounts
  const allWasteTreatmentCapacityApplicationLines =
    await ApplicationLine.listForWasteActivities(context)
  // filter out the discounts, prevents them being included in task list
  const wasteTreatmentCapacityApplicationLines =
    allWasteTreatmentCapacityApplicationLines.filter(({ value }) => value > -1)
  // return and add a boolean "has next" pagination flag
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

async function listAllAnswers (context) {
  const submittedPerActivity = {}
  // get all application lines
  const allWasteTreatmentCapacityApplicationLines =
    await ApplicationLine.listForWasteActivities(context)
  // remove discount lines
  const applicationLinesMinusDiscounts = allWasteTreatmentCapacityApplicationLines.filter(al => al.value >= 0)
  applicationLinesMinusDiscounts.forEach(al => {
    submittedPerActivity[al.id] = {
      lineName: al.lineName,
      answers: []
    }
  })
  // create an array containing answer arrays for each application line
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
  // flatten the arrays
  const weightTreatments = [].concat.apply([], weightTreatmentArrays)
  // turn the arrays into an object, using applicationLineId as key
  const weightTreatmentsByActivity = weightTreatments
    .reduce((accumulator, weightTreatmentAnswer) => {
      const arr =
        accumulator[weightTreatmentAnswer.applicationLineId].answers
      accumulator[weightTreatmentAnswer.applicationLineId].answers =
        arr.concat(weightTreatmentAnswer)
      return accumulator
    }, submittedPerActivity)
  // iterate the object and filter the questions down to those with user input
  Object.keys(weightTreatmentsByActivity).forEach(activityId => {
    const submittedArr = weightTreatmentsByActivity[activityId].answers
      .filter(answer => {
        return answer.answerCode === 'yes' || answer.answerText
      })
    submittedPerActivity[activityId].answers = submittedArr
  })
  // for use in task-list validation
  let allValid = true
  // iterate the object again and work out if all the questions have a satisfactory answer
  Object.keys(submittedPerActivity).forEach(activityId => {
    const answers = submittedPerActivity[activityId].answers
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
          valid = true
        }
      })
    }
    submittedPerActivity[activityId].valid = valid
    if (valid === false) {
      // when we find an invalid answer, let the task-list know
      allValid = false
    }
  })
  submittedPerActivity.allValid = allValid
  return submittedPerActivity
}

async function saveAnswers (context, activityIndex, answers) {
  // take aswers that have been checked
  const positiveAnswers = Object.keys(answers)
  const { applicationLine, hasNext } =
    await getRelevantApplicationLine(context, activityIndex)
  let noTreatment = false
  const toSave = treatmentAnswers.map(ta => {
    const rtn = []
    const answerCode = positiveAnswers.indexOf(ta.questionCode) >= 0 ? 'yes' : 'no'
    if (answerCode === 'no' && ta.questionCode !== 'treatment-none') {
      // editing may cause previous weights to becom invalid
      // make sure corresponding weightTreatment is set to empty (remove it)
      rtn.push({
        applicationLineId: applicationLine.id,
        questionCode: ta.weightTreatmentCode,
        answerText: undefined
      })
    }
    if (ta.questionCode === 'treatment-none' && answerCode === 'yes') {
      // let controller know not to route to the weights screen
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
}

async function saveWeights (context, activityIndex, weightTreatments) {
  const { applicationLine, hasNext } =
    await getRelevantApplicationLine(context, activityIndex)
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
}

async function getForActivity (context, activityIndex) {
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
}

// wasteTreatmentCapacityModel
module.exports = {
  treatmentAnswers,
  getForActivity,
  saveWeights,
  saveAnswers,
  getTreatmentAnswerForQuestionCode,
  getTreatmentAnswerForWeightTreatmentCode,
  getCleanQuestionText,
  listAllAnswers,
  getAllWeightsHaveBeenEnteredForApplication: async function (context) {
    const allAnswers = await listAllAnswers(context)
    return allAnswers.allValid
  }
}
