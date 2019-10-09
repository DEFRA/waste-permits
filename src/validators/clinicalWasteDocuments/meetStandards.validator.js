'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('../base.validator')

const MEET_STANDARDS_ERROR_MESSAGE = 'Select yes or no'

module.exports = class OperatingUnder500HoursValidator extends BaseValidator {
  get errorMessages () {
    return {
      'meet-standards': {
        'any.empty': MEET_STANDARDS_ERROR_MESSAGE,
        'any.required': MEET_STANDARDS_ERROR_MESSAGE
      }
    }
  }

  get formValidators () {
    return {
      'meet-standards': Joi
        .required()
    }
  }
}
