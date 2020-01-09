'use strict'

const DataStore = require('../models/dataStore.model')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const TREATMENT_HAZARDOUS_ANSWER = 'treatment-hazardous'
const TREATMENT_BIOLOGICAL_ANSWER = 'treatment-biological'
const TREATMENT_CHEMICAL_ANSWER = 'treatment-chemical'
const TREATMENT_INCINERATION_ANSWER = 'treatment-incineration'
const TREATMENT_SLAGS_ANSWER = 'treatment-slags'
const TREATMENT_METAL_ANSWER = 'treatment-metal'
const TREATMENT_NONE_ANSWER = 'treatment-none'

const TREATMENT_HAZARDOUS_DAILY = 'treatment-hazardous-daily'
const TREATMENT_BIOLOGICAL_DAILY = 'treatment-biological-daily'
const TREATMENT_CHEMICAL_DAILY = 'treatment-chemical-daily'
const TREATMENT_INCINERARION_DAILY = 'treatment-incineration-daily'
const TREATMENT_SLAGS_DAILY = 'treatment-slags-daily'
const TREATMENT_METAL_DAILY = 'treatment-metal-daily'

const APPLICATION_ANSWERS = {
  [TREATMENT_HAZARDOUS_ANSWER]: 'hazAnswer',
  [TREATMENT_BIOLOGICAL_ANSWER]: 'bioAnswer',
  [TREATMENT_CHEMICAL_ANSWER]: 'chemAnswer',
  [TREATMENT_INCINERATION_ANSWER]: 'incinerationAnswer',
  [TREATMENT_SLAGS_ANSWER]: 'slagAnswer',
  [TREATMENT_METAL_ANSWER]: 'metalAnswer',
  [TREATMENT_NONE_ANSWER]: 'noneAnswer',
  [TREATMENT_HAZARDOUS_DAILY]: 'hazWeight',
  [TREATMENT_BIOLOGICAL_DAILY]: 'bioWeight',
  [TREATMENT_CHEMICAL_DAILY]: 'chemWeight',
  [TREATMENT_INCINERARION_DAILY]: 'incinerationWeight',
  [TREATMENT_SLAGS_DAILY]: 'slagWeight',
  [TREATMENT_METAL_DAILY]: 'metalWeight'
}

async function listForWasteActivitiesMinusDiscountLines (context) {
  // fetch all application lines, including discounts
  const allWasteTreatmentCapacityApplicationLines = await ApplicationLine.listForWasteActivities(context)
  // filter out the discounts, prevents them being included in task list
  const wasteTreatmentCapacityApplicationLines = allWasteTreatmentCapacityApplicationLines.filter(({ value }) => value > -1)
  return wasteTreatmentCapacityApplicationLines
}

module.exports = class WasteTreatmentCapacities {
  constructor ({
    forActivityIndex = 0,
    activityDisplayName = '',
    hasNext = false,
    hazAnswer,
    bioAnswer,
    chemAnswer,
    incinerationAnswer,
    slagAnswer,
    metalAnswer,
    noneAnswer,
    hazWeight,
    bioWeight,
    chemWeight,
    incinerationWeight,
    slagWeight,
    metalWeight
  } = {}) {
    Object.assign(this, {
      forActivityIndex,
      activityDisplayName,
      hasNext,
      hazAnswer,
      bioAnswer,
      chemAnswer,
      incinerationAnswer,
      slagAnswer,
      metalAnswer,
      noneAnswer,
      hazWeight,
      bioWeight,
      chemWeight,
      incinerationWeight,
      slagWeight,
      metalWeight
    })
  }

  static async getForActivity (context, activityIndex) {
    const wasteTreatmentCapacityApplicationLines = await listForWasteActivitiesMinusDiscountLines(context)
    const wasteTreatmentCapacityApplicationLine = wasteTreatmentCapacityApplicationLines[activityIndex]

    if (wasteTreatmentCapacityApplicationLine) {
      const hasNext = Boolean(wasteTreatmentCapacityApplicationLines[activityIndex + 1])
      const definedName = wasteTreatmentCapacityApplicationLine.lineName || ''
      const activityDisplayName = `${definedName}`.trim()
      const { data: { acceptsHazardousWaste } } = await DataStore.get(context)
      const hasHazardousWaste = Boolean(acceptsHazardousWaste)

      const wasteTreatmentCapacityAnswers = await ApplicationAnswer
        .listForApplicationLine(
          context,
          wasteTreatmentCapacityApplicationLine.id,
          Object.keys(APPLICATION_ANSWERS)
        )
      console.log(wasteTreatmentCapacityAnswers)
      const data = wasteTreatmentCapacityAnswers.reduce((acc, { questionCode, answerText }) => {
        const propertyName = APPLICATION_ANSWERS[questionCode]
        acc[propertyName] = answerText
        return acc
      }, {})
      const { nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum } = data

      return new WasteTreatmentCapacities({ forActivityIndex: activityIndex, activityDisplayName, hasNext, hasHazardousWaste, nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum })
    }
  }

  static async getAllForApplication (context) {
    const wasteTreatmentCapacityApplicationLines = await ApplicationLine.listForWasteActivities(context)
    if (!wasteTreatmentCapacityApplicationLines) {
      return []
    }

    const { data: { acceptsHazardousWaste } } = await DataStore.get(context)
    const hasHazardousWaste = Boolean(acceptsHazardousWaste)

    const allWasteWeightAnswers = await ApplicationAnswer
      .listByMultipleQuestionCodes(context, Object.keys(APPLICATION_ANSWERS))

    return wasteTreatmentCapacityApplicationLines.map((wasteTreatmentCapacityApplicationLine, index, allLines) => {
      const hasNext = Boolean(allLines[index + 1])
      const definedName = wasteTreatmentCapacityApplicationLine.lineName || ''
      const activityDisplayName = `${definedName}`.trim()

      const wasteTreatmentCapacityAnswers = allWasteWeightAnswers.filter(({ applicationLineId }) => applicationLineId === wasteTreatmentCapacityApplicationLine.id)

      const data = wasteTreatmentCapacityAnswers.reduce((acc, { questionCode, answerText }) => {
        const propertyName = APPLICATION_ANSWERS[questionCode]
        acc[propertyName] = answerText
        return acc
      }, {})
      const { nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum } = data

      return new WasteTreatmentCapacities({ forActivityIndex: index, activityDisplayName, hasNext, hasHazardousWaste, nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum })
    })
  }

  async save (context) {
    const wasteTreatmentCapacityApplicationLines = await listForWasteActivitiesMinusDiscountLines(context)
    const wasteTreatmentCapacityApplicationLine = wasteTreatmentCapacityApplicationLines[this.forActivityIndex]
    if (wasteTreatmentCapacityApplicationLine) {
      const applicationLineId = wasteTreatmentCapacityApplicationLine.id
      const applicationAnswerSaves = []
      applicationAnswerSaves.push(new ApplicationAnswer({
        applicationLineId,
        questionCode: TREATMENT_HAZARDOUS_ANSWER,
        answerText: this.nonHazardousThroughput
      }).save(context))

      await Promise.all(applicationAnswerSaves)
    }
  }

  static async getAllWeightsHaveBeenEnteredForApplication (context) {
    const wasteTreatmentCapacityApplicationLines = await listForWasteActivitiesMinusDiscountLines(context)
    const requiredEntries = []

    const wasteTreatmentCapacityAnswers = await ApplicationAnswer
      .listByMultipleQuestionCodes(context, Object.keys(APPLICATION_ANSWERS))

    return wasteTreatmentCapacityApplicationLines
      .every(({ id }) => requiredEntries
        .every((requiredEntry) => wasteTreatmentCapacityAnswers
          .find(({ applicationLineId, questionCode, answerText }) => (applicationLineId === id) && (questionCode === requiredEntry) && answerText)))
  }
}
