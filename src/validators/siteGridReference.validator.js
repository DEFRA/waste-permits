'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const GRID_REFERENCE_REGEX = /[a-zA-Z]{2}[\d+]{10}/g

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
