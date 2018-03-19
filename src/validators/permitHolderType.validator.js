'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PermitHolderTypeValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'chosen-holder-type': {
        'any.empty': 'Select who will be the permit holder',
        'any.required': 'Select who will be the permit holder'
      }
    }
  }

  getFormValidators () {
    return {
      'chosen-holder-type': Joi
        .string()
        .required()
    }
  }
}
