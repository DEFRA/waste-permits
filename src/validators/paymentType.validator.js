'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PaymentTypeValidator extends BaseValidator {
  get errorMessages () {
    return {
      'payment-type': {
        'any.required': 'Select how you want to pay'
      }
    }
  }

  get formValidators () {
    return {
      'payment-type': Joi
        .string()
        .required()
    }
  }
}
