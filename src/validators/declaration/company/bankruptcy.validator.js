'use strict'

const Joi = require('joi')
const BaseValidator = require('../../base.validator')
const Application = require('../../../persistence/entities/application.entity')

module.exports = class BankruptcyValidator extends BaseValidator {
  get errorMessages () {
    return {
      declared: {
        'string.empty': 'Select yes if you have bankruptcy or insolvency to declare or no if you do not',
        'any.required': 'Select yes if you have bankruptcy or insolvency to declare or no if you do not'
      },
      'declaration-details': {
        'string.empty': 'Enter details of the bankruptcy or insolvency',
        'any.required': 'Enter details of the bankruptcy or insolvency',
        'string.max': `You can only enter ${Application.bankruptcyDetails.length.max.toLocaleString()} characters - please shorten what you have written`
      }
    }
  }

  getDeclaredDetailsMaxLength () {
    return Application.bankruptcyDetails.length.max
  }

  get formValidators () {
    return {
      declared: Joi
        .required(),
      'declaration-details': Joi
        .string()
        .max(Application.bankruptcyDetails.length.max)
        .when('declared', {
          is: 'yes',
          then: Joi.required()
        })
    }
  }
}
