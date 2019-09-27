'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

const MESSAGE = 'Say if you will meet the standards for managing hazardous waste'

module.exports = class MeetHazWasteStandardsValidator extends BaseValidator {
  get errorMessages () {
    return {
      'meet-standards': {
        'any.required': MESSAGE,
        'any.empty': MESSAGE,
        'any.allowOnly': MESSAGE
      }
    }
  }

  get formValidators () {
    return {
      'meet-standards': Joi
        .string()
        .required()
        .valid('yes', 'no')
    }
  }
}
