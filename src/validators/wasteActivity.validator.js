'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class WasteActivityValidator extends BaseValidator {
  get errorMessages () {
    return {
      'activity': {
        'any.empty': 'Select at least one activity',
        'any.required': 'Select at least one activity'
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
