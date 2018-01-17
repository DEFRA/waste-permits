'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const CHARACTER_LIMIT = 170
const CHARACTER_LIMIT_POSTCODE = 12
// const DISALLOWED_CHARACTERS = '^ | _ ~ ¬ `'
// const DISALLOWED_CHARACTERS_REGEX = /[\^|_~¬`]/g

module.exports = class AddressManualValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'building-name-or-number': {
        'any.empty': `Enter the building name or number`,
        'any.required': `Enter the building name or number`,
        'string.max': `Enter a shorter building name or number with no more than ${CHARACTER_LIMIT} characters`
        // 'string.regex.invert.base': `The site name cannot contain any of these characters: ${DISALLOWED_CHARACTERS}`
      },
      'address-line-1': {
        'any.empty': `Enter an address line 1`,
        'any.required': `Enter an address line 1`,
        'string.max': `Enter a shorter address line 1 with no more than ${CHARACTER_LIMIT} characters`
      },
      'address-line-2': {
        'string.max': `Enter a shorter address line 2 with no more than ${CHARACTER_LIMIT} characters`
      },
      'town-or-city': {
        'any.empty': `Enter a town or city`,
        'any.required': `Enter a town or city`,
        'string.max': `Enter a shorter town or city with no more than ${CHARACTER_LIMIT} characters`
      },
      'postcode': {
        'any.empty': `Enter a postcode`,
        'any.required': `Enter a postcode`,
        'string.max': `Enter a shorter postcode with no more than ${CHARACTER_LIMIT_POSTCODE} characters`
      }
    }
  }

  getFormValidators () {
    return {
      'building-name-or-number': Joi
        .string()
        .max(CHARACTER_LIMIT)
        .required(),
      'address-line-1': Joi
        .string()
        .max(CHARACTER_LIMIT)
        .required(),
      'address-line-2': Joi
        .string()
        .max(CHARACTER_LIMIT),
      'town-or-city': Joi
        .string()
        .max(CHARACTER_LIMIT)
        .required(),
      'postcode': Joi
        .string()
        .max(CHARACTER_LIMIT_POSTCODE)
        .required()
    }
  }
}
