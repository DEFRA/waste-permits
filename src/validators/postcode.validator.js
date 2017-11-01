'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PostcodeValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'postcode': {
        'any.empty': `Enter a postcode`,
        'any.required': `Enter a postcode`
        // TODO valid postcode
        // 'string.max': `Enter a shorter site name with no more than 170 characters`,
        // 'string.regex.invert.base': `The site name cannot contain any of these characters: ${DISALLOWED_CHARACTERS}`
      }
    }
  }

  static getFormValidators () {
    return {
      'postcode': Joi
        .string()
        // .regex(DISALLOWED_CHARACTERS_REGEX, {
        //   invert: true
        // })
        .required()
    }
  }
}
