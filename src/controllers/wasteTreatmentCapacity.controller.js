'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const wasteTreatmentCapacitiesPt2 = require('../models/wasteTreatmentCapacityPt2.model')
const { WASTE_TREATMENT_CAPACITY: { path } } = require('../routes')

const getSavedForProvidedActivityIndex = async (context, request) => {
  const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
  if (!Number.isNaN(activityIndexInt)) {
    const res = await wasteTreatmentCapacitiesPt2.getForActivity(context, activityIndexInt)
    if (res) {
      return res
    }
  }
  throw new Error('Invalid activity')
}

module.exports = class WasteTreatmentCapacityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteTreatmentCapacities =
      await getSavedForProvidedActivityIndex(context, request)

    const pageHeading =
      `Does ${wasteTreatmentCapacities.activityDisplayName} include any treatment of these waste types?`
    const pageTitle = Constants.buildPageTitle(pageHeading)

    const pageContext = this.createPageContext(h, errors)
    Object.assign(pageContext, { pageHeading, pageTitle })

    if (errors) {
      pageContext.formValues = request.payload
    } else {
      pageContext.treatments = wasteTreatmentCapacitiesPt2.treatmentAnswers.map(treatment => {
        const saved = wasteTreatmentCapacities
          .wasteTreatmentCapacityAnswers.find(ans =>
            ans.questionCode === treatment.questionCode && ans.answerCode === 'yes')
        const isSelected = Boolean(saved)
        return {
          id: treatment.questionCode,
          text: treatment.questionText,
          isSelected
        }
      })
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    await wasteTreatmentCapacitiesPt2.saveAnswers(request.payload)

    const pageContext = {
      pageHeading: 'Thanks',
      treatment: []
    }

    return this.showView({ h, pageContext })
    /*
    const wasteTreatmentCapacities = await getModelForProvidedActivityIndex(context, request)

    const {
      'non-hazardous-throughput': nonHazardousThroughput,
      'non-hazardous-maximum': nonHazardousMaximum,
      'hazardous-throughput': hazardousThroughput,
      'hazardous-maximum': hazardousMaximum
    } = request.payload

    Object.assign(wasteTreatmentCapacities, {
      nonHazardousThroughput: String(nonHazardousThroughput),
      nonHazardousMaximum: String(nonHazardousMaximum)
    })
    if (wasteTreatmentCapacities.hasHazardousWaste) {
      Object.assign(wasteTreatmentCapacities, {
        hazardousThroughput: String(hazardousThroughput),
        hazardousMaximum: String(hazardousMaximum)
      })
    }
    await wasteTreatmentCapacities.save(context)

    // If there are more activities, redirect to the next set of weights
    if (wasteTreatmentCapacities.hasNext) {
      return this.redirect({ h, path: `${path}/${wasteTreatmentCapacities.forActivityIndex + 1}` })
    }

    return this.redirect({ h })
    */
  }
}
