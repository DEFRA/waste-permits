'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitCategoryValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'selection': {
        'any.empty': 'Tell us if we have assessed your waste recovery plan',
        'any.required': 'Tell us if we have assessed your waste recovery plan'
      }
    }
  }

  getFormValidators () {
    return {
      'selection': Joi
        .required()
    }
  }
}
