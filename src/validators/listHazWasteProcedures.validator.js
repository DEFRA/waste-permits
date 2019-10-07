'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

const MISSING_MESSAGE = 'List the procedures you will use'

module.exports = class MeetHazWasteStandardsValidator extends BaseValidator {
  get errorMessages () {
    return {
      'procedures-list': {
        'any.required': MISSING_MESSAGE,
        'any.empty': MISSING_MESSAGE,
        'string.max': `Enter a list with no more than 500 characters`
      }
    }
  }

  get formValidators () {
    return {
      'procedures-list': Joi
        .string()
        .required()
        .max(500)
    }
  }
}
