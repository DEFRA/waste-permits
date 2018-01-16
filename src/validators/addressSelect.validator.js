'use strict'

const BaseValidator = require('./base.validator')

module.exports = class SiteNameValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  getFormValidators () {
    return {}
  }
}
