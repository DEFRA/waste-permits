'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const ERROR_MESSAGE = 'You must select an answer'

module.exports = class PermitLengthValidator extends BaseValidator {
  get errorMessages () {
    return {
      'permit-length': {
        'string.empty': ERROR_MESSAGE,
        'any.required': ERROR_MESSAGE
      }
    }
  }

  get formValidators () {
    return {
      'permit-length': Joi
        .required()
    }
  }
}
