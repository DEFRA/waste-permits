'use strict'

const { SHOW_COST_AND_TIME } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')

module.exports = class CostTime extends BaseTask {
  static get completenessParameter () {
    return SHOW_COST_AND_TIME
  }
}
