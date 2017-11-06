'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

// const POSTCODE_REGEX = /^(([a-zA-Z]{1}[\s]*){2}([\d+]{1}[\s]*){10})$/g
// FORMAT      EXAMPLE
// AN NAA      M1 1AA
// ANN NAA     M60 1NW
// AAN NAA     CR2 6XH
// AANN NAA    DN55 1PT
// ANA NAA     W1A 1HQ
// AANA NAA    EC1A 1BB
const POSTCODE_REGEX = /^[a-zA-Z]{1}[\s]*[\d+]{1}[\s]*[\d+]{1}[\s]*[a-zA-Z]{1}[\s]*[a-zA-Z]{1}[\s]*$/g

module.exports = class PostcodeValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'postcode': {
        'any.empty': `Enter a postcode`,
        'any.required': `Enter a postcode`,
        'string.max': `Enter a valid UK postcode`,
        'string.regex.base': `Enter a valid UK postcode`
      }
    }
  }

  static getFormValidators () {
    return {
      'postcode': Joi
        .string()
        .regex(POSTCODE_REGEX)
        .required()
    }
  }
}
