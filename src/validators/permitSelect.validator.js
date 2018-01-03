'use strict'

const Joi = require('joi')
const Constants = require('../constants')
const BaseValidator = require('./base.validator')

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
        .valid(Constants.ALLOWED_PERMITS)
    }
  }
}
