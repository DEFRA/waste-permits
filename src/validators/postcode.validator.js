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
      }
    }
  }

  static getFormValidators () {
    return {
      'postcode': Joi
        .string()
        .required()
    }
  }
}
