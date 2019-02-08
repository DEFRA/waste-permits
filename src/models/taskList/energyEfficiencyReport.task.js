'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class EnergyEfficiencyReport extends BaseTask {
  static async checkComplete (context) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, Constants.UploadSubject.ENERGY_EFFICIENCY_REPORT)
    return Boolean(evidence.length)
  }
}
