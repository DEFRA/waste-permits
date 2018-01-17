'use strict'

const BaseValidator = require('./base.validator')

module.exports = class ContactDetailsValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  getFormValidators () {
    return {}
  }
}
