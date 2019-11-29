'use strict'

const { CLIMATE_CHANGE_RISK_ASSESSMENT } = require('../../constants').UploadSubject

const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')
const ClimateChangeRiskScreeningModel = require('../climateChangeRiskScreening.model')

module.exports = class ClimateChangeRiskScreening extends BaseTask {
  static async checkComplete (context) {
    const climateChangeRiskScreening = await ClimateChangeRiskScreeningModel.get(context)
    const uploadRequired = await ClimateChangeRiskScreeningModel.isUploadRequired(climateChangeRiskScreening)

    if (uploadRequired === undefined) { return false }
    if (uploadRequired === false) { return true }

    const uploaded = await Annotation.listByApplicationIdAndSubject(context, CLIMATE_CHANGE_RISK_ASSESSMENT).length !== 0
    return uploadRequired && uploaded
  }
}
