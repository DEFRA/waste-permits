'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const CHARACTER_LIMIT = 170

// Can’t start or end with a hyphen
const STARTS_OR_ENDS_WITH_HYPHEN_REGEX = /^-|-$/g

// Only numbers, letters, apostrophes, dashes and spaces
const VALID_CHARACTERS_REGEX = /^[a-zA-Z0-9'\- ]*$/g

// Only letters, apostrophes, dashes and spaces
const VALID_CHARACTERS_REGEX_NO_NUMBERS = /^[a-zA-Z'\- ]*$/g

const STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE = `<FIELD> can’t start or end with a dash - please delete it`
const INVALID_CHARS_ERROR_MESSAGE = `<FIELD> contains text we can’t accept - enter only numbers, letters, apostrophes, dashes and spaces`
const INVALID_CHARS_ERROR_MESSAGE_NO_NUMBERS = `<FIELD> contains text we can’t accept - enter only letters, apostrophes, dashes and spaces`

const FIELD_NAMES = {
  BUILDING_NAME_OR_NUMBER: 'building name or number',
  ADDRESS_LINE_1: 'address line 1',
  ADDRESS_LINE_2: 'address line 2',
  TOWN_OR_CITY: 'town or city',
  POSTCODE: 'postcode'
}

module.exports = class AddressManualValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'building-name-or-number': {
        'any.empty': `Enter the ${FIELD_NAMES.BUILDING_NAME_OR_NUMBER}`,
        'any.required': `Enter the ${FIELD_NAMES.BUILDING_NAME_OR_NUMBER}`,
        'string.max': `Enter a shorter ${FIELD_NAMES.BUILDING_NAME_OR_NUMBER} with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace(
          '<FIELD>',
          `${FIELD_NAMES.BUILDING_NAME_OR_NUMBER.charAt(0).toUpperCase()}${FIELD_NAMES.BUILDING_NAME_OR_NUMBER.substr(1)}`),
        'string.regex.base': INVALID_CHARS_ERROR_MESSAGE.replace(
          '<FIELD>',
          `${FIELD_NAMES.BUILDING_NAME_OR_NUMBER.charAt(0).toUpperCase()}${FIELD_NAMES.BUILDING_NAME_OR_NUMBER.substr(1)}`)
      },
      'address-line-1': {
        'any.empty': `Enter an ${FIELD_NAMES.ADDRESS_LINE_1}`,
        'any.required': `Enter an ${FIELD_NAMES.ADDRESS_LINE_1}`,
        'string.max': `Enter a shorter ${FIELD_NAMES.ADDRESS_LINE_1} with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace(
          '<FIELD>',
          `${FIELD_NAMES.ADDRESS_LINE_1.charAt(0).toUpperCase()}${FIELD_NAMES.ADDRESS_LINE_1.substr(1)}`)
      },
      'address-line-2': {
        'string.max': `Enter a shorter ${FIELD_NAMES.ADDRESS_LINE_2} with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace(
          '<FIELD>',
          `${FIELD_NAMES.ADDRESS_LINE_2.charAt(0).toUpperCase()}${FIELD_NAMES.ADDRESS_LINE_2.substr(1)}`)
      },
      'town-or-city': {
        'any.empty': `Enter a ${FIELD_NAMES.TOWN_OR_CITY}`,
        'any.required': `Enter a ${FIELD_NAMES.TOWN_OR_CITY}`,
        'string.max': `Enter a shorter ${FIELD_NAMES.TOWN_OR_CITY} with no more than ${CHARACTER_LIMIT} characters`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace(
          '<FIELD>',
          `${FIELD_NAMES.TOWN_OR_CITY.charAt(0).toUpperCase()}${FIELD_NAMES.TOWN_OR_CITY.substr(1)}`),
        'string.regex.base': INVALID_CHARS_ERROR_MESSAGE_NO_NUMBERS.replace(
          '<FIELD>',
          `${FIELD_NAMES.TOWN_OR_CITY.charAt(0).toUpperCase()}${FIELD_NAMES.TOWN_OR_CITY.substr(1)}`)
      },
      'postcode': {
        'any.empty': `Enter a valid ${FIELD_NAMES.POSTCODE}`,
        'any.required': `Enter a valid ${FIELD_NAMES.POSTCODE}`,
        'string.regex.invert.base': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace(
          '<FIELD>',
          `${FIELD_NAMES.POSTCODE.charAt(0).toUpperCase()}${FIELD_NAMES.POSTCODE.substr(1)}`)
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
        .max(CHARACTER_LIMIT)
        .required()
        .regex(STARTS_OR_ENDS_WITH_HYPHEN_REGEX, {
          invert: true
        })
        .regex(VALID_CHARACTERS_REGEX_NO_NUMBERS),
      'postcode': Joi
        .string()
        .required()
        .regex(STARTS_OR_ENDS_WITH_HYPHEN_REGEX, {
          invert: true
        })
    }
  }
}
