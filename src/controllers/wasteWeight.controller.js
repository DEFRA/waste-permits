'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteWeights = require('../models/wasteWeights.model')
const { WASTE_WEIGHT: { path } } = require('../routes')

const getModelForProvidedActivityIndex = async (context, request) => {
  const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
  if (!Number.isNaN(activityIndexInt)) {
    const wasteWeights = await WasteWeights.getForActivity(context, activityIndexInt)
    if (wasteWeights) {
      return wasteWeights
    }
  }
  throw new Error('Invalid activity')
}

module.exports = class WasteWeightController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteWeights = await getModelForProvidedActivityIndex(context, request)
    const pageHeading = `Enter the waste weights for ${wasteWeights.activityDisplayName}`
    const pageTitle = Constants.buildPageTitle(pageHeading)

    const { hasHazardousWaste, nonHazardousThroughput, nonHazardousMaximum, hazardousThroughput, hazardousMaximum } = wasteWeights

    const pageContext = this.createPageContext(h, errors)
    Object.assign(pageContext, { pageHeading, pageTitle, hasHazardousWaste })

    if (errors) {
      pageContext.formValues = request.payload
    } else {
      const formValues = {
        'non-hazardous-throughput': nonHazardousThroughput,
        'non-hazardous-maximum': nonHazardousMaximum
      }
      if (hasHazardousWaste) {
        formValues['hazardous-throughput'] = hazardousThroughput
        formValues['hazardous-maximum'] = hazardousMaximum
      }
      pageContext.formValues = formValues
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteWeights = await getModelForProvidedActivityIndex(context, request)

    const {
      'non-hazardous-throughput': nonHazardousThroughput,
      'non-hazardous-maximum': nonHazardousMaximum,
      'hazardous-throughput': hazardousThroughput,
      'hazardous-maximum': hazardousMaximum
    } = request.payload

    Object.assign(wasteWeights, {
      nonHazardousThroughput: String(nonHazardousThroughput),
      nonHazardousMaximum: String(nonHazardousMaximum)
    })
    if (wasteWeights.hasHazardousWaste) {
      Object.assign(wasteWeights, {
        hazardousThroughput: String(hazardousThroughput),
        hazardousMaximum: String(hazardousMaximum)
      })
    }
    await wasteWeights.save(context)

    // If there are more activities, redirect to the next set of weights
    if (wasteWeights.hasNext) {
      return this.redirect({ h, path: `${path}/${wasteWeights.forActivityIndex + 1}` })
    }

    return this.redirect({ h })
  }
}
