'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class StartOrOpenSavedValidator extends BaseValidator {
  get errorMessages () {
    return {
      'existing-permit': {
        'any.required': 'Select a value',
        'any.allowOnly': 'Provide a valid value'
      }
    }
  }

  get formValidators () {
    return {
      'existing-permit': Joi.string().required().valid('yes', 'no')
    }
  }
}
