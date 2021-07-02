'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const NAME_LENGTH_MAX = 150

module.exports = class AirQualityManagementAreaValidator extends BaseValidator {
  get errorMessages () {
    return {
      'aqma-is-in-aqma': {
        'any.required': 'Please select Yes or No',
        'boolean.base': 'Please select Yes or No'
      },
      'aqma-name': {
        'any.required': 'Enter the AQMA name',
        'string.max': `Enter the AQMA name with fewer than ${NAME_LENGTH_MAX} characters`
      },
      'aqma-nitrogen-dioxide-level': {
        'any.empty': 'Enter the background level of nitrogen dioxide',
        'any.required': 'Enter the background level of nitrogen dioxide',
        'string.regex.base': 'The background level should be a whole number between 0 and 100'
      },
      'aqma-local-authority-name': {
        'any.required': 'Enter the local authority name',
        'string.max': `Enter the local authority name with fewer than ${NAME_LENGTH_MAX} characters`
      }
    }
  }

  get formValidators () {
    const isInAqmaCheck = Joi
      .string()
      .required()
      .valid('yes', 'no')

    const nameCheck = Joi
      .string()
      .max(NAME_LENGTH_MAX)
      .when('aqma-is-in-aqma', {
        is: 'yes',
        then: Joi.required()
      })

    // This has to be validated as a string, otherwise Joi converts our input to a number
    // and Dynamics will only accept values cast as a string, not a number.
    // Therefore we use regex to check for whole numbers in the range 0-100.
    const nitrogenDioxideLevelCheck = Joi
      .string()
      .regex(/^([1-9]?\d|100)$/)
      .when('aqma-is-in-aqma', {
        is: 'yes',
        then: Joi.required()
      })

    return {
      'aqma-is-in-aqma': isInAqmaCheck,
      'aqma-name': nameCheck,
      'aqma-nitrogen-dioxide-level': nitrogenDioxideLevelCheck,
      'aqma-local-authority-name': nameCheck
    }
  }
}
