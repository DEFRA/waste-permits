'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('../base.validator')
const Address = require('../../persistence/entities/address.entity')

// Can’t start or end with a hyphen
const STARTS_OR_ENDS_WITH_HYPHEN_REGEX = /^-|-$/

// Only numbers, letters, apostrophes, dashes and spaces
const VALID_CHARACTERS_REGEX = /^[a-zA-Z0-9'\- ]*$/

// Only letters, apostrophes, dashes and spaces
const VALID_CHARACTERS_REGEX_NO_NUMBERS = /^[a-zA-Z'\- ]*$/

// More than one apostrophe is not allowed
const MULTIPLE_APOSTROPHES_REGEX = /'/g

const STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE = '<FIELD> cannot start or end with a dash - please delete it'
const INVALID_CHARS_ERROR_MESSAGE = '<FIELD> contains text we cannot accept - enter only numbers, letters, apostrophes, dashes and spaces'
const INVALID_CHARS_ERROR_MESSAGE_NO_NUMBERS = '<FIELD> contains text we cannot accept - enter only letters, apostrophes, dashes and spaces'

module.exports = class AddressManualValidator extends BaseValidator {
  get errorMessages () {
    return {
      'building-name-or-number': {
        'any.empty': 'Enter the building name or number',
        'any.required': 'Enter the building name or number',
        'string.max': `Enter a shorter building name or number with no more than ${Address.buildingNameOrNumber.length.max} characters`,
        'custom.starts.or.ends.hyphen': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', 'Building name or number'),
        'custom.invalid.characters': INVALID_CHARS_ERROR_MESSAGE.replace('<FIELD>', 'Building name or number'),
        'custom.address.lookup.failed': 'Please enter the address below'
      },
      'address-line-1': {
        'any.empty': 'Enter an address line 1',
        'any.required': 'Enter an address line 1',
        'string.max': `Enter a shorter address line 1 with no more than ${Address.addressLine1.length.max} characters`,
        'custom.starts.or.ends.hyphen': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', 'Address line 1')
      },
      'address-line-2': {
        'string.max': `Enter a shorter address line 2 with no more than ${Address.addressLine2.length.max} characters`,
        'custom.starts.or.ends.hyphen': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', 'Address line 2')
      },
      'town-or-city': {
        'any.empty': 'Enter a town or city',
        'any.required': 'Enter a town or city',
        'string.max': `Enter a shorter town or city with no more than ${Address.townOrCity.length.max} characters`,
        'custom.starts.or.ends.hyphen': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', 'Town or city'),
        'custom.invalid.characters.no.numbers': INVALID_CHARS_ERROR_MESSAGE_NO_NUMBERS.replace('<FIELD>', 'Town or city'),
        'custom.multiple.apostrophes': 'Town or city can only contain one apostrophe - remove all but one'
      },
      postcode: {
        'string.max': `Enter a shorter postcode with no more than ${Address.postcode.length.max} characters`,
        'custom.starts.or.ends.hyphen': STARTS_OR_ENDS_WITH_HYPHEN_MESSAGE.replace('<FIELD>', 'Postcode')
      }
    }
  }

  get formValidators () {
    return {
      'building-name-or-number': Joi
        .string()
        .max(Address.buildingNameOrNumber.length.max)
        .required(),
      'address-line-1': Joi
        .string()
        .max(Address.addressLine1.length.max)
        .required(),
      'address-line-2': Joi
        .string()
        .max(Address.addressLine2.length.max),
      'town-or-city': Joi
        .string()
        .max(Address.townOrCity.length.max)
        .required(),
      postcode: Joi
        .string()
        .max(Address.postcode.length.max)
    }
  }

  get customValidators () {
    return {
      'building-name-or-number': {
        'custom.starts.or.ends.hyphen': (value) => (STARTS_OR_ENDS_WITH_HYPHEN_REGEX).test(value),
        'custom.invalid.characters': (value) => !(VALID_CHARACTERS_REGEX).test(value)
      },
      'address-line-1': {
        'custom.starts.or.ends.hyphen': (value) => (STARTS_OR_ENDS_WITH_HYPHEN_REGEX).test(value)
      },
      'address-line-2': {
        'custom.starts.or.ends.hyphen': (value) => (STARTS_OR_ENDS_WITH_HYPHEN_REGEX).test(value)
      },
      'town-or-city': {
        'custom.multiple.apostrophes': (value) => ((value.match(MULTIPLE_APOSTROPHES_REGEX) || []).length > 1),
        'custom.starts.or.ends.hyphen': (value) => (STARTS_OR_ENDS_WITH_HYPHEN_REGEX).test(value),
        'custom.invalid.characters.no.numbers': (value) => !(VALID_CHARACTERS_REGEX_NO_NUMBERS).test(value)
      },
      postcode: {
        'custom.starts.or.ends.hyphen': (value) => (STARTS_OR_ENDS_WITH_HYPHEN_REGEX).test(value)
      }
    }
  }
}
