'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitCategoryValidator extends BaseValidator {
  get errorMessages () {
    return {
      'chosen-category': {
        'any.empty': 'Select what you want the permit for',
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
