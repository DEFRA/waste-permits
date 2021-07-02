'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class WasteActivityValidator extends BaseValidator {
  get errorMessages () {
    return {
      activity: {
        'string.empty': 'Select at least one activity',
        'any.required': 'Select at least one activity'
      }
    }
  }

  get formValidators () {
    return {
      activity: Joi
        .string()
        .required()
    }
  }
}
