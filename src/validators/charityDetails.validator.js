'use strict'

const Joi = require('@hapi/joi')

const BaseValidator = require('./base.validator')
const MAX_NAME_LENGTH = 170
const MAX_NUMBER_LENGTH = 10

const generalCharityNumberError = 'Enter a valid charity number'

module.exports = class CharityDetailsValidator extends BaseValidator {
  get errorMessages () {
    return {
      'charity-name': {
        'any.empty': 'Enter the charity name',
        'any.required': 'Enter the charity name',
        'string.max': `Enter a shorter name with no more than ${MAX_NAME_LENGTH} characters`
      },
      'charity-number': {
        'any.empty': generalCharityNumberError,
        'any.required': generalCharityNumberError,
        'string.max': generalCharityNumberError
      }
    }
  }

  get formValidators () {
    return {
      'charity-name': Joi
        .string()
        .max(MAX_NAME_LENGTH)
        .required(),
      'charity-number': Joi
        .string()
        .max(MAX_NUMBER_LENGTH)
        .required()
    }
  }
}
