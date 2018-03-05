'use strict'

const Joi = require('joi')
const BaseValidator = require('../../base.validator')
const Application = require('../../../models/application.model')

module.exports = class ConfidentialityValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'declared': {
        'any.empty': `Select yes if you want to claim confidentiality or no if you don't`,
        'any.required': `Select yes if you want to claim confidentiality or no if you don't`
      },
      'declaration-details': {
        'any.empty': `Explain what information is confidential and why`,
        'any.required': `Explain what information is confidential and why`,
        'string.max': `You can only enter ${Application.confidentialityDetails.length.max.toLocaleString()} characters - please shorten what you’ve written`
      }
    }
  }

  getDeclaredDetailsMaxLength () {
    return Application.confidentialityDetails.length.max
  }

  getFormValidators () {
    return {
      'declared': Joi
        .required(),
      'declaration-details': Joi
        .string()
        .max(Application.confidentialityDetails.length.max)
        .when('declared', {
          is: 'yes',
          then: Joi.required() })
    }
  }
}
