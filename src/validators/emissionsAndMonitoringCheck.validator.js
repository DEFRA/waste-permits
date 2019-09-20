'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class EmissionsAndMonitoringCheckValidator extends BaseValidator {
  get errorMessages () {
    return {
      'emissions-made': {
        'any.empty': 'Select yes or no',
        'any.required': 'Select yes or no'
      }
    }
  }

  get formValidators () {
    return {
      'emissions-made': Joi
        .required()
    }
  }
}
