'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

const OFFENCE_DETAILS_MAX_LENGTH = 2000

module.exports = class DeclareOffencesValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'offences': {
        'any.empty': `Select yes if you have convictions to declare or no if you don't`,
        'any.required': `Select yes if you have convictions to declare or no if you don't`
      },
      'relevant-offences-details': {
        'any.empty': `Enter details of the convictions`,
        'any.required': `Enter details of the convictions`,
        'string.max': `You can only enter ${OFFENCE_DETAILS_MAX_LENGTH.toLocaleString()} characters - please shorten what you’ve written`
      }
    }
  }

  static getOfficeDetailsMaxLength () {
    return OFFENCE_DETAILS_MAX_LENGTH
  }

  static getFormValidators () {
    return {
      'offences': Joi
        .required(),
      'relevant-offences-details': Joi
        .string()
        .max(OFFENCE_DETAILS_MAX_LENGTH)
        .when('offences', {
          is: 'yes',
          then: Joi.required() })
    }
  }
}
