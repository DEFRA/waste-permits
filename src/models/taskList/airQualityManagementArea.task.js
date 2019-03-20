'use strict'

const BaseTask = require('./base.task')
const AirQualityManagementAreaModel = require('../airQualityManagementArea.model')

module.exports = class AirQualityManagementArea extends BaseTask {
  static async checkComplete (context) {
    const aqma = await AirQualityManagementAreaModel.get(context)

    if (Object.keys(aqma).length === 0) {
      return false
    }

    return Boolean(
      (
        !aqma.isInAqma || (
          aqma.name &&
          aqma.nitrogenDioxideLevel &&
          aqma.localAuthorityName
        ))
    )
  }
}