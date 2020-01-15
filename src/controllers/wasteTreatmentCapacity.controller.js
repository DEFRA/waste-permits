'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const wasteTreatmentCapacities = require('../models/wasteTreatmentCapacity.model')
const { WASTE_TREATMENT_CAPACITY: { path } } = require('../routes')

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

module.exports = class WasteTreatmentCapacityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const savedTreatmentCapacities =
      await getSavedForProvidedActivityIndex(context, request)

    const pageHeading =
      `Does ${savedTreatmentCapacities.activityDisplayName} include any treatment of these waste types?`
    const pageTitle = Constants.buildPageTitle(pageHeading)

    const pageContext = this.createPageContext(h, errors)
    Object.assign(pageContext, { pageHeading, pageTitle })

    pageContext.treatments = wasteTreatmentCapacities.treatmentAnswers.map(treatment => {
      const saved = savedTreatmentCapacities
        .wasteTreatmentCapacityAnswers
        .find(ans =>
          // check the appropriate boxes based on the data coming
          // back from dynamics
          ans.questionCode ===
          treatment.questionCode && ans.answerCode === 'yes')
      const isSelected = Boolean(saved) ||
        // there are errors so use the payload to work out what is checked
        errors
        ? request.payload.hasOwnProperty(treatment.questionCode)
        : false
      return {
        id: treatment.questionCode,
        text: treatment.questionText,
        isSelected
      }
    })

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
    const saveResult = await wasteTreatmentCapacities.saveAnswers(
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
