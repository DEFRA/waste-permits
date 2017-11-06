'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

// Must be 2 letters (case insensitive) and 10 digits, e.g. AB1234567890 or ab1234567890
// The requirement is to ignore whitespace contained within the grid reference,
// therefore 'AB   12345 6 7 8 9 0' is deemed to be valid input
const GRID_REFERENCE_REGEX = /^(([a-zA-Z]{1}[\s]*){2}([\d+]{1}[\s]*){10})$/g

module.exports = class SiteGridReferenceValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'site-grid-reference': {
        'any.empty': `Enter a grid reference`,
        'any.required': `Enter a grid reference`,
        'string.regex.base': `Make sure that the grid reference has 2 letters and 10 digits`
      }
    }
  }

  static getFormValidators () {
    return {
      'site-grid-reference': Joi
        .string()
        .regex(GRID_REFERENCE_REGEX)
        .required()
    }
  }
}
