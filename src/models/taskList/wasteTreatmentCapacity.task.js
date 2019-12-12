'use strict'

const BaseTask = require('./base.task')
const WasteTreatmentCapacitysModel = require('../wasteTreatmentCapacity.model')

module.exports = class WasteTreatmentCapacity extends BaseTask {
  static async checkComplete (context) {
    return WasteTreatmentCapacitysModel.getAllWeightsHaveBeenEnteredForApplication(context)
  }
}
