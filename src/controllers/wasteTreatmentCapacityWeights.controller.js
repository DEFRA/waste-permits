'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const wasteTreatmentCapacities = require('../models/wasteTreatmentCapacity.model')
const { WASTE_TREATMENT_CAPACITY_TYPES: { path } } = require('../routes')

const getSavedForProvidedActivityIndex = async (context, request) => {
  const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
  if (!Number.isNaN(activityIndexInt)) {
    const res = await wasteTreatmentCapacities.getForActivity(context, activityIndexInt)
    if (res) {
      return res
    }
  }
  throw new Error('Invalid activity')
}

module.exports = class WasteTreatmentCapacityWeightsController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const savedTreatmentCapacities =
      await getSavedForProvidedActivityIndex(context, request)

    const pageHeading =
      `Enter the daily treatment capacity for
        ${savedTreatmentCapacities.activityDisplayName}`
    const pageTitle = Constants.buildPageTitle(pageHeading)

    const pageContext = this.createPageContext(h, errors)
    Object.assign(pageContext, { pageHeading, pageTitle })

    const errArr = pageContext.errorList
      ? pageContext.errorList.map(err => err.fieldName)
      : []

    pageContext.treatments = []

    const savedWeights = savedTreatmentCapacities
      .wasteTreatmentCapacityAnswers
      .filter(t => t.answerText)

    const savedTypes = savedTreatmentCapacities
      .wasteTreatmentCapacityAnswers
      .filter(t => t.answerCode === 'yes')

    const filtered = wasteTreatmentCapacities
      .treatmentAnswers
      .filter(t => savedTypes.find(st => st.questionCode === t.questionCode))

    pageContext.treatments = filtered.map(treatment => ({
      text: treatment.questionText,
      id: treatment.weightCode,
      // feed the weight submitted back to the view (not saved yet)
      weight: request.payload ? request.payload[treatment.weightCode] : 0,
      // if the weightCode show up in the validation errors feed
      // that back to the view for error highlight
      error: errArr.indexOf(treatment.weightCode) >= 0
    }))

    pageContext.treatments.forEach(t => {
      const saved = savedWeights.find(tw => tw.questionCode === t.id)
      if (saved) {
        t.weight = Number(saved.answerText)
      }
      if (request.payload && request.payload[t.id]) {
        t.weight = request.payload[t.id]
      }
    })

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
    const saveResult = await wasteTreatmentCapacities.saveWeights(
      context,
      activityIndexInt,
      request.payload
    )

    if (saveResult.hasNext) {
      //  there are more activities
      //  redirect to the next set of questions
      return this.redirect({
        h,
        path: `${path}/${saveResult.forActivityIndex + 1}`
      })
    }
    // we're done, back to the task list
    return this.redirect({ h })
  }
}
