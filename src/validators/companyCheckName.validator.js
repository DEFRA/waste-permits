'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const Application = require('../models/application.model')

module.exports = class CompanyCheckNameValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'business-trading-name': {
        'any.empty': `Enter a business trading name`,
        'any.required': `Enter a business trading name`,
        'string.max': `Enter a shorter trading name with no more than ${Application.tradingName.length.max} characters`
      }
    }
  }

  getFormValidators () {
    return {
      'business-trading-name': Joi
        .string()
        .max(Application.tradingName.length.max)
        .when('use-business-trading-name', {
          is: 'on',
          then: Joi.required() })
    }
  }
}
