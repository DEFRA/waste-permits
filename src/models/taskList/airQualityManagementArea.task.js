'use strict'

const BaseTask = require('./base.task')
const AirQualityManagementAreaModel = require('../airQualityManagementArea.model')

module.exports = class AirQualityManagementArea extends BaseTask {
  static async checkComplete (context) {
    const aqma = await AirQualityManagementAreaModel.get(context)

    return Boolean(
      (
        aqma.isInAqma === false || (
          aqma.isInAqma &&
          aqma.name &&
          aqma.nitrogenDioxideLevel &&
          aqma.localAuthorityName
        ))
    )
  }
}
