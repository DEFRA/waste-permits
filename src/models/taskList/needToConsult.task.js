'use strict'

const BaseTask = require('./base.task')
const NeedToConsultModel = require('../needToConsult.model')

module.exports = class NeedToConsult extends BaseTask {
  static async checkComplete (context) {
    const consult = await NeedToConsultModel.get(context)

    return Boolean(
      (consult.none || consult.sewer || consult.harbour || consult.fisheries) &&
        (!consult.sewer || consult.sewerageUndertaker) &&
        (!consult.harbour || consult.harbourAuthority) &&
        (!consult.fisheries || consult.fisheriesCommittee)
    )
  }
}
