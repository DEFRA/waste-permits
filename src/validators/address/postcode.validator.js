'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('../base.validator')

module.exports = class PostcodeValidator extends BaseValidator {
  get errorMessages () {
    return {
      'postcode': {
        'any.empty': `Enter a postcode`,
        'any.required': `Enter a postcode`,
        'invalid': `Enter a valid postcode`,
        'none.found': `We cannot find any addresses for that postcode - check it is correct or enter address manually`
      }
    }
  }

  get formValidators () {
    return {
      'postcode': Joi
        .string()
        .required()
    }
  }
}
