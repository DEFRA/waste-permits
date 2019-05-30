'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const Constants = require('../constants')
const AddressDetail = require('../persistence/entities/addressDetail.entity')
const { EMAIL_VALID_REGEX } = Constants.Validation

module.exports = class ContactDetailsValidator extends BaseValidator {
  get errorMessages () {
    return {
      email: {
        'any.empty': `Enter a valid email address`,
        'any.required': `Enter a valid email address`,
        'string.regex.base': `Enter a valid email address`,
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
