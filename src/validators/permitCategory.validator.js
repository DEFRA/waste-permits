'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitCategoryValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'chosen-category': {
        'any.empty': 'Select what you want the permit for',
        'any.required': 'Select what you want the permit for'
      }
    }
  }

  getFormValidators () {
    return {
      'chosen-category': Joi
        .required()
    }
  }
}
