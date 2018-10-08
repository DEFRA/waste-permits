'use strict'

const BaseValidator = require('./base.validator')

module.exports = class TaskListValidator extends BaseValidator {
  get errorMessages () {
    return {}
  }
}
