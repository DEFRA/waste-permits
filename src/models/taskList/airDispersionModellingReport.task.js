'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class AirDispersionModellingReport extends BaseTask {
  static async checkComplete (context) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, Constants.UploadSubject.AIR_DISPERSION_MODELLING_REPORT)
    return Boolean(evidence.length)
  }
}
