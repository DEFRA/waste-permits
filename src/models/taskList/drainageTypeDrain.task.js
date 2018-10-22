'use strict'

const { SURFACE_DRAINAGE } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')

module.exports = class DrainageTypeDrain extends BaseTask {
  static get completenessParameter () {
    return SURFACE_DRAINAGE
  }
}
