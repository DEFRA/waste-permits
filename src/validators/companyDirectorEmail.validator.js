'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const Constants = require('../constants')
const AddressDetail = require('../persistence/entities/addressDetail.entity')
const { EMAIL_VALID_REGEX } = Constants.Validation

const generalEmailError = 'Enter a valid email address'

module.exports = class ContactDetailsValidator extends BaseValidator {
  get errorMessages () {
    return {
      email: {
        'string.empty': generalEmailError,
        'any.required': generalEmailError,
        'string.regex.base': generalEmailError,
        'string.max': `Enter a shorter email address with no more than ${AddressDetail.email.length.max} characters`
      }
    }
  }

  get formValidators () {
    return {
      email: Joi
        .string()
        .max(AddressDetail.email.length.max)
        .regex(EMAIL_VALID_REGEX)
        .required()
    }
  }
}
