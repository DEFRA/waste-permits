'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

module.exports = class AddressSelectValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'select-address': {
        'any.required': `Select an address`
      }
    }
  }

  getFormValidators () {
    return {
      'select-address': Joi.string().required()
    }
  }
}
