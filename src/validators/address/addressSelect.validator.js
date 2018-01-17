'use strict'

const BaseValidator = require('../base.validator')

module.exports = class AddressSelectValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  getFormValidators () {
    return {}
  }
}
