'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class McpBusinessActivityValidator extends BaseValidator {
  get errorMessages () {
    return {
      'type-codes-option': {
        'any.empty': 'Select the business or activity',
        'any.required': 'Select the business or activity'
      },
      'type-codes-other': {
        'any.empty': 'Enter a valid 4-digit code that includes the decimal dot',
        'any.required': 'Enter a valid 4-digit code that includes the decimal dot',
        'string.regex.base': 'Enter a valid 4-digit code that includes the decimal dot'
      }
    }
  }

  get formValidators () {
    return {
      'type-codes-option': Joi
        .required(),
      'type-codes-other': Joi
        .when('type-codes-option', {
          is: 'other',
          then: Joi.string().required().regex(/^\d\d\.\d\d$/),
          otherwise: Joi.optional()
        })
    }
  }
}
