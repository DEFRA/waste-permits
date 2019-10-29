'use strict'

const BaseTask = require('./base.task')
const WasteWeightsModel = require('../wasteWeights.model')

module.exports = class WasteWeights extends BaseTask {
  static async checkComplete (context) {
    return WasteWeightsModel.getAllWeightsHaveBeenEnteredForApplication(context)
  }
}
