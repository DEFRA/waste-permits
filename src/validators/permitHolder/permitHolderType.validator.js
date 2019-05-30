'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('../base.validator')

module.exports = class PermitHolderTypeValidator extends BaseValidator {
  get errorMessages () {
    return {
      'chosen-holder-type': {
        'any.empty': 'Select who will be the permit holder',
        'any.required': 'Select who will be the permit holder'
      }
    }
  }

  get formValidators () {
    return {
      'chosen-holder-type': Joi
        .string()
        .required()
    }
  }
}
