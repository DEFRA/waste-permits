'use strict'

const Joi = require('joi')
const BaseValidator = require('../../base.validator')
const Application = require('../../../persistence/entities/application.entity')

module.exports = class ConfidentialityValidator extends BaseValidator {
  get errorMessages () {
    return {
      declared: {
        'string.empty': 'Select yes if you want to claim confidentiality or no if you do not',
        'any.required': 'Select yes if you want to claim confidentiality or no if you do not'
      },
      'declaration-details': {
        'string.empty': 'Explain what information is confidential and why',
        'any.required': 'Explain what information is confidential and why',
        'string.max': `You can only enter ${Application.confidentialityDetails.length.max.toLocaleString()} characters - please shorten what you have written`
      }
    }
  }

  getDeclaredDetailsMaxLength () {
    return Application.confidentialityDetails.length.max
  }

  get formValidators () {
    return {
      declared: Joi
        .required(),
      'declaration-details': Joi
        .string()
        .max(Application.confidentialityDetails.length.max)
        .when('declared', {
          is: 'yes',
          then: Joi.required()
        })
    }
  }
}
