'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const STORE_TREAT_ERROR_MESSAGE = 'Select yes or no'

module.exports = class StoreTreatValidator extends BaseValidator {
  get errorMessages () {
    return {
      'store-treat': {
        'any.empty': STORE_TREAT_ERROR_MESSAGE,
        'any.required': STORE_TREAT_ERROR_MESSAGE
      }
    }
  }

  get formValidators () {
    return {
      'store-treat': Joi
        .required()
    }
  }
}
