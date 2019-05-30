'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

// Must be 2 letters (case insensitive) and 6 digits or 8 digits, e.g. 12345678 or 01234567 or AB123456 or ab123456
// The requirement is to ignore whitespace contained within the company registration number,
// therefore both 'AB   12345 6' and '00 11 22 33' are deemed to be valid input
const COMPANY_REG_NUMBER_REGEX = /^(([a-zA-Z]{1}[\s]*){2}|([\d+]{1}[\s]*){2})([\d+]{1}[\s]*){6}$/

module.exports = class CompanyNumberValidator extends BaseValidator {
  get errorMessages () {
    return {
      'company-number': {
        'any.empty': `Enter a company registration number`,
        'any.required': `Enter a company registration number`,
        'string.regex.base': `Enter a valid company registration number with either 8 digits or 2 letters and 6 digits`
      }
    }
  }

  get formValidators () {
    return {
      'company-number': Joi
        .string()
        .required()
        .regex(COMPANY_REG_NUMBER_REGEX)
    }
  }
}
