'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteTreatmentCapacitys = require('../models/wasteTreatmentCapacity.model')
const { WASTE_WEIGHT: { path } } = require('../routes')

const getModelForProvidedActivityIndex = async (context, request) => {
  const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
  if (!Number.isNaN(activityIndexInt)) {
    const wasteTreatmentCapacitys = await WasteTreatmentCapacitys.getForActivity(context, activityIndexInt)
    if (wasteTreatmentCapacitys) {
      return wasteTreatmentCapacitys
    }
  }
  throw new Error('Invalid activity')
}

module.exports = class WasteTreatmentCapacityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteTreatmentCapacitys = await getModelForProvidedActivityIndex(context, request)
    const pageHeading = `Enter the waste weights for ${wasteTreatmentCapacitys.activityDisplayName}`
    const pageTitle = Constants.buildPageTitle(pageHeading)

    const {
      hasHazardousWaste,
      nonHazardousThroughput,
      nonHazardousMaximum,
      hazardousThroughput,
      hazardousMaximum
    } = wasteTreatmentCapacitys

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
    const wasteTreatmentCapacitys = await getModelForProvidedActivityIndex(context, request)

    const {
      'non-hazardous-throughput': nonHazardousThroughput,
      'non-hazardous-maximum': nonHazardousMaximum,
      'hazardous-throughput': hazardousThroughput,
      'hazardous-maximum': hazardousMaximum
    } = request.payload

    Object.assign(wasteTreatmentCapacitys, {
      nonHazardousThroughput: String(nonHazardousThroughput),
      nonHazardousMaximum: String(nonHazardousMaximum)
    })
    if (wasteTreatmentCapacitys.hasHazardousWaste) {
      Object.assign(wasteTreatmentCapacitys, {
        hazardousThroughput: String(hazardousThroughput),
        hazardousMaximum: String(hazardousMaximum)
      })
    }
    await wasteTreatmentCapacitys.save(context)

    // If there are more activities, redirect to the next set of weights
    if (wasteTreatmentCapacitys.hasNext) {
      return this.redirect({ h, path: `${path}/${wasteTreatmentCapacitys.forActivityIndex + 1}` })
    }

    return this.redirect({ h })
  }
}
