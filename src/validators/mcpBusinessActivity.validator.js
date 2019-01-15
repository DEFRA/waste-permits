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
        'any.empty': 'Select the business or activity',
        'any.required': 'Select the business or activity'
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
          then: Joi.required(),
          otherwise: Joi.optional() })
    }
  }
}
