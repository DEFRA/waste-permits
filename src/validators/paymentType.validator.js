'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PaymentTypeValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'payment-type': {
        'any.required': 'Select how you want to pay'
      }
    }
  }

  getFormValidators () {
    return {
      'payment-type': Joi
        .string()
        .required()
    }
  }
}
