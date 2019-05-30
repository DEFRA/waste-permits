'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class HabitatAssessmentValidator extends BaseValidator {
  get errorMessages () {
    return {
      'habitat-assessment': {
        'any.empty': 'Select yes or no',
        'any.required': 'Select yes or no'
      }
    }
  }

  get formValidators () {
    return {
      'habitat-assessment': Joi
        .required()
    }
  }
}
