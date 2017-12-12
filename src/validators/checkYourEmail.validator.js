'use strict'

// const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class CheckYourEmailValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  getFormValidators () {
    return {}
  }
}
