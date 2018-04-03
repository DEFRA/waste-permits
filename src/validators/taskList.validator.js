'use strict'

const BaseValidator = require('./base.validator')

module.exports = class TaskListValidator extends BaseValidator {
  constructor () {
    super()

    // There are no error messages defined because we do not currently display field errors if the task list fails validation
    this.errorMessages = {}
  }

  getFormValidators () {
    return {}
  }
}
