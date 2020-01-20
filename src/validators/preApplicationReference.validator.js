'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const { PRE_APPLICATION_REFERENCE_REGEX } = require('../constants').Validation

module.exports = class PreApplicationReferenceValidator extends BaseValidator {
  get errorMessages () {
    return {
      'pre-application-reference': {
        'any.required': 'Enter a pre-application reference number',
        'custom.invalid': 'Enter a reference number in the correct format'
      }
    }
  }

  get formValidators () {
    return {
      'pre-application-reference': Joi
        .required()
    }
  }

  get customValidators () {
    return {
      'pre-application-reference': {
        'custom.invalid': (value) => !(PRE_APPLICATION_REFERENCE_REGEX).test(value)
      }
    }
  }
}
