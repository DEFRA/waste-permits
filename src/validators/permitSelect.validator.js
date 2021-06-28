'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitSelectValidator extends BaseValidator {
  get errorMessages () {
    return {
      'chosen-permit': {
        'any.required': 'Select the permit you want'
      }
    }
  }

  get formValidators () {
    return {
      'chosen-permit': Joi
        .string()
        .required()
    }
  }
}
