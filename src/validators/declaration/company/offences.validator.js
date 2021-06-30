'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('../../base.validator')
const Application = require('../../../persistence/entities/application.entity')

module.exports = class OffencesValidator extends BaseValidator {
  get errorMessages () {
    return {
      declared: {
        'any.empty': 'Select yes if you have convictions to declare or no if you do not',
        'any.required': 'Select yes if you have convictions to declare or no if you do not'
      },
      'declaration-details': {
        'any.empty': 'Enter details of the convictions',
        'any.required': 'Enter details of the convictions',
        'string.max': `You can only enter ${Application.relevantOffencesDetails.length.max.toLocaleString()} characters - please shorten what you have written`
      }
    }
  }

  getDeclaredDetailsMaxLength () {
    return Application.relevantOffencesDetails.length.max
  }

  get formValidators () {
    return {
      declared: Joi
        .required(),
      'declaration-details': Joi
        .string()
        .max(Application.relevantOffencesDetails.length.max)
        .when('declared', {
          is: 'yes',
          then: Joi.required()
        })
    }
  }
}
