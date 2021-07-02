'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const Application = require('../persistence/entities/application.entity')

module.exports = class CompanyCheckNameValidator extends BaseValidator {
  get errorMessages () {
    return {
      'business-trading-name': {
        'string.empty': 'Enter a business trading name',
        'any.required': 'Enter a business trading name',
        'string.max': `Enter a shorter trading name with no more than ${Application.tradingName.length.max} characters`
      }
    }
  }

  get formValidators () {
    return {
      'business-trading-name': Joi
        .string()
        .max(Application.tradingName.length.max)
        .when('use-business-trading-name', {
          is: 'on',
          then: Joi.required()
        })
    }
  }
}
