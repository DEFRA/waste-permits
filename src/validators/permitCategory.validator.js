'use strict'

// const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitCategoryValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {}
  }

  static getFormValidators () {
    return {}
  }
}
