'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('../base.validator')

module.exports = class AddressSelectValidator extends BaseValidator {
  get errorMessages () {
    return {
      'select-address': {
        'any.required': 'Select an address'
      }
    }
  }

  get formValidators () {
    return {
      'select-address': Joi.string().required()
    }
  }
}
