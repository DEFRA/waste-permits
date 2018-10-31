'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

module.exports = class PermitHolderTypeValidator extends BaseValidator {
  get errorMessages () {
    return {
      'permit-holder-type': {
        'any.empty': 'Select who will be the permit holder',
        'any.required': 'Select who will be the permit holder'
      }
    }
  }

  get formValidators () {
    return {
      'permit-holder-type': Joi
        .string()
        .required()
    }
  }
}
