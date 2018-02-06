'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const CHARACTER_LIMIT = 170
const TOWN_OR_CITY_CHARACTER_LIMIT = 70
const POSTCODE_CHARACTER_LIMIT = 8

// Can’t start or end with a hyphen
const STARTS_OR_ENDS_WITH_HYPHEN_REGEX = /^-|-$/g

// Only numbers, letters, apostrophes, dashes and spaces
const VALID_CHARACTERS_REGEX = /^[a-zA-Z0-9'\- ]*$/g

// Only letters, apostrophes, dashes and spaces
const VALID_CHARACTERS_REGEX_NO_NUMBERS = /^[a-zA-Z'\- ]*$/g

const STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE = `<FIELD> can’t start or end with a dash - please delete it`
const INVALID_CHARS_ERROR_MESSAGE = `<FIELD> contains text we can’t accept - enter only numbers, letters, apostrophes, dashes and spaces`
const INVALID_CHARS_ERROR_MESSAGE_NO_NUMBERS = `<FIELD> contains text we can’t accept - enter only letters, apostrophes, dashes and spaces`

module.exports = class AddressManualValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'building-name-or-number': {
        'any.empty': `Enter the building name or number`,
        'any.required': `Enter the building name or number`,
        'string.max': `Enter a shorter building name or number with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', `Building name or number`),
        'string.regex.base': INVALID_CHARS_ERROR_MESSAGE.replace('<FIELD>', `Building name or number`)
      },
      'address-line-1': {
        'any.empty': `Enter an address line 1`,
        'any.required': `Enter an address line 1`,
        'string.max': `Enter a shorter address line 1 with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', `Address line 1`)
      },
      'address-line-2': {
        'string.max': `Enter a shorter address line 2 with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', `Address line 2`)

      },
      'town-or-city': {
        'any.empty': `Enter a town or city`,
        'any.required': `Enter a town or city`,
        'string.max': `Enter a shorter town or city with no more than ${TOWN_OR_CITY_CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', `Town or city`),
        'string.regex.base': INVALID_CHARS_ERROR_MESSAGE_NO_NUMBERS.replace('<FIELD>', `Town or city`),
        'custom.multiple.apostrophes': 'Town or city can only contain one apostrophe - remove all but one'
      },
      'postcode': {
        'any.empty': `Enter a valid postcode`,
        'any.required': `Enter a valid postcode`,
        'string.max': `Enter a shorter postcode with no more than ${POSTCODE_CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', `Postcode`)
      }
    }
  }

  getFormValidators () {
    return {
      'building-name-or-number': Joi
        .string()
        .max(CHARACTER_LIMIT)
        .required()
        .regex(STARTS_OR_ENDS_WITH_HYPHEN_REGEX, {
          invert: true
        })
        .regex(VALID_CHARACTERS_REGEX),
      'address-line-1': Joi
        .string()
        .max(CHARACTER_LIMIT)
        .required()
        .regex(STARTS_OR_ENDS_WITH_HYPHEN_REGEX, {
          invert: true
        }),
      'address-line-2': Joi
        .string()
        .max(CHARACTER_LIMIT)
        .regex(STARTS_OR_ENDS_WITH_HYPHEN_REGEX, {
          invert: true
        }),
      'town-or-city': Joi
        .string()
        .max(TOWN_OR_CITY_CHARACTER_LIMIT)
        .required()
        .regex(STARTS_OR_ENDS_WITH_HYPHEN_REGEX, {
          invert: true
        })
        .regex(VALID_CHARACTERS_REGEX_NO_NUMBERS),
      'postcode': Joi
        .string()
        .max(POSTCODE_CHARACTER_LIMIT)
        .required()
        .regex(STARTS_OR_ENDS_WITH_HYPHEN_REGEX, {
          invert: true
        })
    }
  }

  customValidators () {
    return {
      'town-or-city': {
        // More than one apostrophe is not allowed
        'custom.multiple.apostrophes': (value) => (value.match(/'/g) || []).length > 1
      }
    }
  }
}
