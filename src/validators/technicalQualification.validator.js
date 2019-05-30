'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class TechnicalQualificationValidator extends BaseValidator {
  get errorMessages () {
    return {
      'technical-qualification': {
        'any.empty': 'Select a qualification',
        'any.required': 'Select a qualification'
      }
    }
  }

  get formValidators () {
    return {
      'technical-qualification': Joi
        .required()
    }
  }
}
