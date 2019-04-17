'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class WasteActivityValidator extends BaseValidator {
  get errorMessages () {
    return {
      'activity': {
        'any.empty': 'Select the activities you want',
        'any.required': 'Select the activities you want'
      }
    }
  }

  get formValidators () {
    return {
      'activity': Joi
        .string()
        .required()
    }
  }
}
