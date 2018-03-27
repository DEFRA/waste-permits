'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const EMAIL_VALID_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

module.exports = class EmailEnterValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'save-and-return-email': {
        'any.empty': `Enter an email address`,
        'any.required': `Enter an email address`,
        'string.regex.base': `Enter a valid email address`
      }
    }
  }

  getFormValidators () {
    return {
      'save-and-return-email': Joi
        .string()
        .regex(EMAIL_VALID_REGEX)
        .required()
    }
  }
}
