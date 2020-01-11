'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteTreatmentCapacities = require('../models/wasteTreatmentCapacity.model')
const WasteTreatmentCapacitiesPt2 = require('../models/wasteTreatmentCapacityPt2.model')
const { WASTE_TREATMENT_CAPACITY: { path } } = require('../routes')

const getModelForProvidedActivityIndex = async (context, request) => {
  const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
  if (!Number.isNaN(activityIndexInt)) {
    const wasteTreatmentCapacities = await WasteTreatmentCapacities.getForActivity(context, activityIndexInt)
    const wasteTreatmentCapacitiesPt2 = await WasteTreatmentCapacitiesPt2.getForActivity(context, activityIndexInt)
    console.log(wasteTreatmentCapacitiesPt2)
    if (wasteTreatmentCapacities) {
      return wasteTreatmentCapacities
    }
  }
  throw new Error('Invalid activity')
}

module.exports = class WasteTreatmentCapacityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteTreatmentCapacities = await getModelForProvidedActivityIndex(context, request)
    console.log(wasteTreatmentCapacities)
    const pageHeading = `Does ${wasteTreatmentCapacities.activityDisplayName} include any treatment of these waste types?`
    const pageTitle = Constants.buildPageTitle(pageHeading)

    const pageContext = this.createPageContext(h, errors)
    Object.assign(pageContext, { pageHeading, pageTitle })

    if (errors) {
      pageContext.formValues = request.payload
    } else {
      pageContext.treatments = [{
        id: 'whatever',
        checked: false,
        text: 'oh yes!'
      }]
      const treatments = []
      for (const item in wasteTreatmentCapacities) {
        treatments.push({
          id: item,
          text: item,
          checked: wasteTreatmentCapacities[item] === undefined ? false : wasteTreatmentCapacities[item]
        })
      }
      pageContext.treatments = treatments
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
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
  }
}
