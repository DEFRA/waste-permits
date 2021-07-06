'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitCategoryValidator extends BaseValidator {
  get errorMessages () {
    return {
      selection: {
        'string.empty': 'Tell us if we have assessed your waste recovery plan',
        'any.required': 'Tell us if we have assessed your waste recovery plan'
      }
    }
  }

  get formValidators () {
    return {
      selection: Joi
        .required()
    }
  }
}
