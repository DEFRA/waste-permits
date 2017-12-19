'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const ALLOWED_PERMITS = ['SR2015 No 18']

module.exports = class PermitSelectValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'chosen-permit': {
        'any.required': `Select the permit you want`,
        'any.allowOnly': `Select a valid permit`
      }
    }
  }

  getFormValidators () {
    return {
      'chosen-permit': Joi
        .string()
        .required()
        .valid(ALLOWED_PERMITS)
    }
  }
}
