'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class noiseVibrationDocuments extends BaseTask {
  static async checkComplete (context) {
    console.log(context)
    const evidence = await Annotation.listByApplicationIdAndSubject(context, Constants.UploadSubject.NOISE_VIBRATION_DOCUMENTS)
    return Boolean(evidence.length)
  }
}
