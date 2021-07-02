'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitCategoryValidator extends BaseValidator {
  get errorMessages () {
    return {
      'chosen-category': {
        'string.empty': 'Select what you want the permit for',
        'any.required': 'Select what you want the permit for'
      }
    }
  }

  get formValidators () {
    return {
      'chosen-category': Joi
        .required()
    }
  }
}
