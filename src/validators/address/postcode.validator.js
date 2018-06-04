'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

module.exports = class PostcodeValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'postcode': {
        'any.empty': `Enter a postcode`,
        'any.required': `Enter a postcode`,
        'invalid': `Enter a valid postcode`,
        'none.found': `We can not find any addresses for that postcode - check it is correct or enter address manually`
      }
    }
  }

  getFormValidators () {
    return {
      'postcode': Joi
        .string()
        .required()
    }
  }
}
