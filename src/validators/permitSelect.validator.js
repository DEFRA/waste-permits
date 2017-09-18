'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const ALLOWED_PERMITS = ['sr-2015-18']

module.exports = class PermitSelectValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'chosen-permit-id': {
        'any.required': `Select the permit you want`,
        'any.allowOnly': `Select a valid permit`
      }
    }
  }

  static getFormValidators () {
    return {
      'chosen-permit-id': Joi
        .string()
        .required()
        .valid(ALLOWED_PERMITS)
    }
  }
}
