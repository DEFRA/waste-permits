'use strict'

const BaseValidator = require('../base.validator')

module.exports = class AddressManualValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  getFormValidators () {
    return {}
  }
}
