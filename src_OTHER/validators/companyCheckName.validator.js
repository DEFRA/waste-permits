'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const COMPANY_NAME_MAX_LENGTH = 170

module.exports = class CompanyCheckNameValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'business-trading-name': {
        'any.empty': `Enter a business trading name`,
        'any.required': `Enter a business trading name`,
        'string.max': `Enter a shorter trading name with no more than 170 characters`
      }
    }
  }

  getFormValidators () {
    return {
      'business-trading-name': Joi
        .string()
        .max(COMPANY_NAME_MAX_LENGTH)
        .when('use-business-trading-name', {
          is: 'on',
          then: Joi.required() })
    }
  }
}
