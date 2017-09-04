'use strict'

const BaseValidator = require('./base.validator')

module.exports = class ContactValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  static getFormValidators () {
    return {}
  }
}
