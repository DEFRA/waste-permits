'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitCategoryValidator extends BaseValidator {
  get errorMessages () {
    return {
      'selection': {
        'any.empty': 'Tell us if we have assessed your waste recovery plan',
        'any.required': 'Tell us if we have assessed your waste recovery plan'
      }
    }
  }

  get formValidators () {
    return {
      'selection': Joi
        .required()
    }
  }
}
