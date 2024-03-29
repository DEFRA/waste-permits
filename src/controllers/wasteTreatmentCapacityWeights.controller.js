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
      id: treatment.weightTreatmentCode,
      // feed the weightTreatment submitted back to the view (not saved yet)
      weight: request.payload ? request.payload[treatment.weightTreatmentCode] : 0,
      // if the weightTreatmentCode show up in the validation errors feed
      // that back to the view for error highlight
      error: errArr.indexOf(treatment.weightTreatmentCode) >= 0
    }))

    pageContext.treatments.forEach(t => {
      const saved = savedWeights.find(tw => tw.questionCode === t.id)
      if (saved) {
        t.weight = Number.parseInt(saved.answerText, 10)
        if (Number.isNaN(t.weight)) {
          t.weight = 0
        }
      }
      if (request.payload && request.payload[t.id]) {
        t.weight = request.payload[t.id]
        if (Number.isNaN(t.weight)) {
          t.weight = 0
        }
      }
    })

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
    if (request.payload) {
      console.log('request.payload', request.payload)
      // although validation has passed, due to the dynamic
      // construction of the form we have to check some things
      // again
      const errors = []
      const savedTreatmentCapacities =
        await getSavedForProvidedActivityIndex(context, request)
      const pageHeading =
        `Enter the daily treatment capacity for
          ${savedTreatmentCapacities.activityDisplayName}`
      const pageTitle = Constants.buildPageTitle(pageHeading)

      const pageContext = this.createPageContext(h, errors)
      Object.assign(pageContext, { pageHeading, pageTitle })
      const savedTypes = savedTreatmentCapacities
        .wasteTreatmentCapacityAnswers
        .filter(t => t.answerCode === 'yes')

      Object.keys(request.payload).forEach(treatmentCode => {
        const numVal = request.payload[treatmentCode]
        const invalid = Number.isNaN(numVal) || numVal <= 0 || numVal > 999999999999999
        if (invalid) {
          console.log(treatmentCode, invalid)
          const found = wasteTreatmentCapacities.getTreatmentAnswerForWeightTreatmentCode(treatmentCode)
          errors.push(found)
        }
      })
      savedTypes.forEach(t => {
        const found = wasteTreatmentCapacities.getTreatmentAnswerForQuestionCode(t.questionCode)
        if (found.weightTreatmentCode) {
          if (!Object.prototype.hasOwnProperty.call(request.payload, found.weightTreatmentCode)) {
            errors.push(found)
            request.payload[found.weightTreatmentCode] = '0'
          }
        }
      })
      if (errors.length > 0) {
        // we've found more validation errors so feed them back to
        // the form via the doGet method
        return this.doGet(request, h, {
          details: errors.map(e => {
            return {
              message: 'You must enter an amount',
              path: [e.weightTreatmentCode],
              type: 'custom-invalid'
            }
          })
        })
      }
    }
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
