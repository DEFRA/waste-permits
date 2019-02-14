'use strict'

const BaseTask = require('./base.task')
const AirQualityManagementModel = require('../airQualityManagement.model')

module.exports = class AirQualityManagement extends BaseTask {
  static async checkComplete (context) {
    const aqma = await AirQualityManagementModel.get(context)

    if (Object.keys(aqma).length === 0) {
      return false
    }

    return Boolean(
      (
        !aqma.aqmaIsInAqma || (
          aqma.aqmaIsInAqma &&
          aqma.aqmaName &&
          aqma.aqmaNitrogenDioxideLevel &&
          aqma.aqmaLocalAuthorityName
        ))
    )
  }
}
