'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const DECLARED_DETAILS_MAX_LENGTH = 2000

module.exports = class DeclareBankruptcyValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'declared': {
        'any.empty': `Select yes if you have bankruptcy or insolvency to declare or no if you don't`,
        'any.required': `Select yes if you have bankruptcy or insolvency to declare or no if you don't`
      },
      'declaration-details': {
        'any.empty': `Enter details of the bankruptcy or insolvency`,
        'any.required': `Enter details of the bankruptcy or insolvency`,
        'string.max': `You can only enter ${DECLARED_DETAILS_MAX_LENGTH.toLocaleString()} characters - please shorten what you’ve written`
      }
    }
  }

  static getDeclaredDetailsMaxLength () {
    return DECLARED_DETAILS_MAX_LENGTH
  }

  static getFormValidators () {
    return {
      'declared': Joi
        .required(),
      'declaration-details': Joi
        .string()
        .max(DECLARED_DETAILS_MAX_LENGTH)
        .when('declared', {
          is: 'yes',
          then: Joi.required() })
    }
  }
}
