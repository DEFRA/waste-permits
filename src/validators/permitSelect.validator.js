'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitSelectValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'chosen-permit': {
        'any.required': `Select the permit you want`
      }
    }
  }

  getFormValidators () {
    return {
      'chosen-permit': Joi
        .string()
        .required()
    }
  }
}
