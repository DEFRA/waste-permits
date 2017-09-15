'use strict'

// const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitSelectValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  static getFormValidators () {
    return {}
  }
}
