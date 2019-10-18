'use strict'

const BaseTask = require('./base.task')
const WasteDisposalAndRecoveryCodesModel = require('../wasteDisposalAndRecoveryCodes.model')

module.exports = class WasteDisposalAndRecoveryCodes extends BaseTask {
  static async checkComplete (context) {
    return WasteDisposalAndRecoveryCodesModel.getAllCodesHaveBeenSelectedForApplication(context)
  }
}
