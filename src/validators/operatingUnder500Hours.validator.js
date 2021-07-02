'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const OPERATING_UNDER_500_HOURS_ERROR_MESSAGE = 'Select yes or no'

module.exports = class OperatingUnder500HoursValidator extends BaseValidator {
  get errorMessages () {
    return {
      'operating-under-500-hours': {
        'any.empty': OPERATING_UNDER_500_HOURS_ERROR_MESSAGE,
        'any.required': OPERATING_UNDER_500_HOURS_ERROR_MESSAGE
      }
    }
  }

  get formValidators () {
    return {
      'operating-under-500-hours': Joi
        .required()
    }
  }
}
