'use strict'

const DataStore = require('../models/dataStore.model')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const NON_HAZ_THROUGHPUT_APPLICATION_ANSWER = 'non-haz-waste-throughput-weight'
const NON_HAZ_MAXIMUM_APPLICATION_ANSWER = 'non-haz-waste-maximum-weight'
const HAZ_THROUGHPUT_APPLICATION_ANSWER = 'haz-waste-throughput-weight'
const HAZ_MAXIMUM_APPLICATION_ANSWER = 'haz-waste-maximum-weight'
const APPLICATION_ANSWERS = {
  [NON_HAZ_THROUGHPUT_APPLICATION_ANSWER]: 'nonHazardousThroughput',
  [NON_HAZ_MAXIMUM_APPLICATION_ANSWER]: 'nonHazardousMaximum',
  [HAZ_THROUGHPUT_APPLICATION_ANSWER]: 'hazardousThroughput',
  [HAZ_MAXIMUM_APPLICATION_ANSWER]: 'hazardousMaximum'
}

async function listForWasteActivitiesMinusDiscountLines (context) {
  // fetch all application lines, including discounts
  const allWasteActivityApplicationLines = await ApplicationLine.listForWasteActivities(context)
  // filter out the discounts, prevents them being included in task list
  const wasteActivityApplicationLines = allWasteActivityApplicationLines.filter(({ value }) => value > -1)
  return wasteActivityApplicationLines
}

module.exports = class WasteWeights {
  constructor ({
    forActivityIndex = 0,
    activityDisplayName = '',
    hasNext = false,
    hasHazardousWaste = false,
    nonHazardousThroughput,
    nonHazardousMaximum,
    hazardousThroughput,
    hazardousMaximum
  } = {}) {
    Object.assign(this, {
      forActivityIndex,
      activityDisplayName,
      hasNext,
      hasHazardousWaste,
      nonHazardousThroughput,
      nonHazardousMaximum,
      hazardousThroughput,
      hazardousMaximum
    })
  }

  static async getForActivity (context, activityIndex) {
    const wasteActivityApplicationLines = await listForWasteActivitiesMinusDiscountLines(context)
    const wasteActivityApplicationLine = wasteActivityApplicationLines[activityIndex]

    if (wasteActivityApplicationLine) {
      const hasNext = Boolean(wasteActivityApplicationLines[activityIndex + 1])
      const definedName = wasteActivityApplicationLine.lineName || ''
      const activityDisplayName = `${definedName}`.trim()
      const { data: { acceptsHazardousWaste } } = await DataStore.get(context)
      const hasHazardousWaste = Boolean(acceptsHazardousWaste)

      const wasteWeightAnswers = await ApplicationAnswer
        .listForApplicationLine(
          context,
          wasteActivityApplicationLine.id,
          Object.keys(APPLICATION_ANSWERS)
        )
      const data = wasteWeightAnswers.reduce((acc, { questionCode, answerText }) => {
        const propertyName = APPLICATION_ANSWERS[questionCode]
        acc[propertyName] = answerText
        return acc
      }, {})
      const { nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum } = data

      return new WasteWeights({ forActivityIndex: activityIndex, activityDisplayName, hasNext, hasHazardousWaste, nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum })
    }
  }

  static async getAllForApplication (context) {
    const wasteActivityApplicationLines = await ApplicationLine.listForWasteActivities(context)
    if (!wasteActivityApplicationLines) {
      return []
    }

    const { data: { acceptsHazardousWaste } } = await DataStore.get(context)
    const hasHazardousWaste = Boolean(acceptsHazardousWaste)

    const allWasteWeightAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, Object.keys(APPLICATION_ANSWERS))

    return wasteActivityApplicationLines.map((wasteActivityApplicationLine, index, allLines) => {
      const hasNext = Boolean(allLines[index + 1])
      const definedName = wasteActivityApplicationLine.lineName || ''
      const activityDisplayName = `${definedName}`.trim()

      const wasteWeightAnswers = allWasteWeightAnswers.filter(({ applicationLineId }) => applicationLineId === wasteActivityApplicationLine.id)

      const data = wasteWeightAnswers.reduce((acc, { questionCode, answerText }) => {
        const propertyName = APPLICATION_ANSWERS[questionCode]
        acc[propertyName] = answerText
        return acc
      }, {})
      const { nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum } = data

      return new WasteWeights({ forActivityIndex: index, activityDisplayName, hasNext, hasHazardousWaste, nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum })
    })
  }

  async save (context) {
    const wasteActivityApplicationLines = await listForWasteActivitiesMinusDiscountLines(context)
    const wasteActivityApplicationLine = wasteActivityApplicationLines[this.forActivityIndex]
    if (wasteActivityApplicationLine) {
      const applicationLineId = wasteActivityApplicationLine.id
      const applicationAnswerSaves = []
      applicationAnswerSaves.push(new ApplicationAnswer({ applicationLineId, questionCode: NON_HAZ_THROUGHPUT_APPLICATION_ANSWER, answerText: this.nonHazardousThroughput }).save(context))
      applicationAnswerSaves.push(new ApplicationAnswer({ applicationLineId, questionCode: NON_HAZ_MAXIMUM_APPLICATION_ANSWER, answerText: this.nonHazardousMaximum }).save(context))
      if (this.hasHazardousWaste) {
        applicationAnswerSaves.push(new ApplicationAnswer({ applicationLineId, questionCode: HAZ_THROUGHPUT_APPLICATION_ANSWER, answerText: this.hazardousThroughput }).save(context))
        applicationAnswerSaves.push(new ApplicationAnswer({ applicationLineId, questionCode: HAZ_MAXIMUM_APPLICATION_ANSWER, answerText: this.hazardousMaximum }).save(context))
      } else {
        applicationAnswerSaves.push(new ApplicationAnswer({ applicationLineId, questionCode: HAZ_THROUGHPUT_APPLICATION_ANSWER }).save(context))
        applicationAnswerSaves.push(new ApplicationAnswer({ applicationLineId, questionCode: HAZ_MAXIMUM_APPLICATION_ANSWER }).save(context))
      }

      await Promise.all(applicationAnswerSaves)
    }
  }

  static async getAllWeightsHaveBeenEnteredForApplication (context) {
    const wasteActivityApplicationLines = await listForWasteActivitiesMinusDiscountLines(context)
    const { data: { acceptsHazardousWaste } } = await DataStore.get(context)
    const requiredEntries = [
      NON_HAZ_THROUGHPUT_APPLICATION_ANSWER,
      NON_HAZ_MAXIMUM_APPLICATION_ANSWER
    ]
    if (acceptsHazardousWaste) {
      requiredEntries.push(HAZ_THROUGHPUT_APPLICATION_ANSWER, HAZ_MAXIMUM_APPLICATION_ANSWER)
    }

    const wasteWeightAnswers = await ApplicationAnswer
      .listByMultipleQuestionCodes(context, Object.keys(APPLICATION_ANSWERS))

    return wasteActivityApplicationLines
      .every(({ id }) => requiredEntries
        .every((requiredEntry) => wasteWeightAnswers
          .find(({ applicationLineId, questionCode, answerText }) => (applicationLineId === id) && (questionCode === requiredEntry) && answerText)))
  }
}
